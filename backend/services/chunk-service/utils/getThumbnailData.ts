import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import ForbiddenError from "../../../utils/ForbiddenError";
import ThumbnailDB from "../../../db/mongoDB/thumbnailDB";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import streamToBuffer from "../../../utils/streamToBuffer";

const thumbnailDB = new ThumbnailDB();

const storageActions = getStorageActions();

const processData = (thumbnailID: string, user: UserInterface) => {
  const eventEmitter = new EventEmitter();

  const processThumbnail = async () => {
    try {
      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const thumbnail = await thumbnailDB.getThumbnailInfo(
        user._id.toString(),
        thumbnailID
      );

      if (!thumbnail) throw new NotFoundError("Thumbnail Not Found");

      const iv = thumbnail.IV;

      const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

      const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, iv);

      const readStreamParams = createGenericParams({
        filePath: thumbnail.path,
        Key: thumbnail.s3ID,
      });

      const readStream = storageActions.createReadStream(readStreamParams);

      decipher.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      readStream.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      const bufferData = await streamToBuffer(readStream.pipe(decipher));

      eventEmitter.emit("finish", bufferData);
    } catch (e) {
      eventEmitter.emit("error", e);
    }
  };

  processThumbnail();

  return eventEmitter;
};

const getThumbnailData = (thumbnailID: string, user: UserInterface) => {
  return new Promise((resolve, reject) => {
    const eventEmitter = processData(thumbnailID, user);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default getThumbnailData;
