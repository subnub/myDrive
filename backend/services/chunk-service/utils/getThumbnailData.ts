import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import { Response } from "express";
import ForbiddenError from "../../../utils/ForbiddenError";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";

import ThumbnailDB from "../../../db/mongoDB/thumbnailDB";

const thumbnailDB = new ThumbnailDB();

const storageActions = getStorageActions();

const proccessData = (
  res: Response,
  thumbnailID: string,
  user: UserInterface
) => {
  const eventEmitter = new EventEmitter();

  const processFile = async () => {
    try {
      const thumbnail = await thumbnailDB.getThumbnailInfo(
        user._id.toString(),
        thumbnailID
      );

      if (!thumbnail) throw new NotFoundError("Thumbnail Not Found");

      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const IV = thumbnail.IV;

      const readStreamParams = createGenericParams({
        filePath: thumbnail.path,
        Key: thumbnail.s3ID,
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

const getThumbnailData = (
  res: Response,
  thumbnailID: string,
  user: UserInterface
) => {
  return new Promise((resolve, reject) => {
    const eventEmitter = proccessData(res, thumbnailID, user);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default getThumbnailData;
