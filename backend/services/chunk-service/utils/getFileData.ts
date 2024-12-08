import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import { Response } from "express";
import ForbiddenError from "../../../utils/ForbiddenError";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import FileDB from "../../../db/mongoDB/fileDB";

const fileDB = new FileDB();

const storageActions = getStorageActions();

const proccessData = (res: Response, fileID: string, user: UserInterface) => {
  const eventEmitter = new EventEmitter();

  const processFile = async () => {
    try {
      const currentFile = await fileDB.getFileInfo(fileID, user._id.toString());

      if (!currentFile) throw new NotFoundError("Download File Not Found");

      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const IV = currentFile.metadata.IV;

      const readStreamParams = createGenericParams({
        filePath: currentFile.metadata.filePath,
        Key: currentFile.metadata.s3ID,
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

      res.set("Content-Type", "binary/octet-stream");
      res.set(
        "Content-Disposition",
        'attachment; filename="' + currentFile.filename + '"'
      );
      res.set("Content-Length", currentFile.metadata.size.toString());

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

const getFileData = (res: Response, fileID: string, user: UserInterface) => {
  return new Promise((resolve, reject) => {
    const eventEmitter = proccessData(res, fileID, user);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default getFileData;
