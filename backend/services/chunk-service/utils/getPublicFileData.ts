import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import { Response } from "express";
import ForbiddenError from "../../../utils/ForbiddenError";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import FileDB from "../../../db/mongoDB/fileDB";
import NotAuthorizedError from "../../../utils/NotAuthorizedError";
import UserDB from "../../../db/mongoDB/userDB";
import sanitizeFilename from "../../../utils/sanitizeFilename";

const fileDB = new FileDB();
const userDB = new UserDB();

const storageActions = getStorageActions();

const proccessData = (res: Response, fileID: string, tempToken: string) => {
  const eventEmitter = new EventEmitter();

  const processFile = async () => {
    try {
      const file = await fileDB.getPublicFile(fileID);

      if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
        throw new NotAuthorizedError("File Not Public");
      }

      if (file.metadata.linkType === "one") {
        await fileDB.removeOneTimePublicLink(fileID);
      }

      const user = await userDB.getUserInfo(file.metadata.owner);

      if (!user) throw new NotFoundError("User Not Found");

      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const IV = file.metadata.IV;

      const readStreamParams = createGenericParams({
        filePath: file.metadata.filePath,
        Key: file.metadata.s3ID,
      });

      const readStream = storageActions.createReadStream(readStreamParams);

      const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

      const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

      decipher.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      readStream.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      res.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      const sanatizedFilename = sanitizeFilename(file.filename);
      const encodedFilename = encodeURIComponent(sanatizedFilename);
      res.set("Content-Type", "binary/octet-stream");
      res.set(
        "Content-Disposition",
        `attachment; filename="${sanatizedFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      res.set("Content-Length", file.metadata.size.toString());

      readStream
        .pipe(decipher)
        .pipe(res)
        .on("finish", () => {
          eventEmitter.emit("finish");
        });
    } catch (e) {
      eventEmitter.emit("error", e);
    }
  };

  processFile();

  return eventEmitter;
};

const getPublicFileData = (
  res: Response,
  fileID: string,
  tempToken: string
) => {
  return new Promise((resolve, reject) => {
    const eventEmitter = proccessData(res, fileID, tempToken);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default getPublicFileData;
