import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail-model";
import sharp from "sharp";
import { FileInterface } from "../../../models/file-model";
import { UserInterface } from "../../../models/user-model";
import uuid from "uuid";
import env from "../../../enviroment/env";
import { createGenericParams } from "./storageHelper";
import { S3Actions } from "../actions/S3-actions";
import { FilesystemActions } from "../actions/file-system-actions";
import { EventEmitter } from "stream";
import FileDB from "../../../db/mongoDB/fileDB";
import { getStorageActions } from "../actions/helper-actions";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

const fileDB = new FileDB();

const storageActions = getStorageActions();

const processData = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  const eventEmitter = new EventEmitter();

  try {
    const password = user.getEncryptionKey();

    let CIPHER_KEY = crypto.createHash("sha256").update(password!).digest();

    const thumbnailFilename = uuid.v4();

    const thumbnailIV = crypto.randomBytes(16);

    const params = createGenericParams({
      filePath: file.metadata.filePath,
      Key: file.metadata.s3ID,
    });

    const readStream = storageActions.createReadStream(params);

    const { writeStream, emitter } = storageActions.createWriteStream(
      params,
      readStream,
      thumbnailFilename
    );

    const decipher = crypto.createDecipheriv(
      "aes256",
      CIPHER_KEY,
      file.metadata.IV
    );

    const imageResize = sharp().resize(300);

    const handleFinish = async () => {
      const thumbnailModel = new Thumbnail({
        name: filename,
        owner: user._id,
        IV: thumbnailIV,
        path: getFSStoragePath() + thumbnailFilename,
        s3ID: thumbnailFilename,
      });

      await thumbnailModel.save();

      const updatedFile = await fileDB.setThumbnail(
        file._id!.toString(),
        thumbnailModel._id.toString()
      );

      if (!updatedFile) {
        throw new Error("Thumbnail Not Set");
      }

      eventEmitter.emit("finish", updatedFile);
    };

    const handleError = (e: Error) => {
      eventEmitter.emit("error", e);
    };

    readStream.on("error", handleError);

    writeStream.on("error", handleError);

    decipher.on("error", handleError);

    imageResize.on("error", handleError);

    const thumbnailCipher = crypto.createCipheriv(
      "aes256",
      CIPHER_KEY,
      thumbnailIV
    );

    readStream
      .pipe(decipher)
      .pipe(imageResize)
      .pipe(thumbnailCipher)
      .pipe(writeStream);

    if (emitter) {
      emitter.on("finish", handleFinish);
    } else {
      writeStream.on("finish", handleFinish);
    }
  } catch (e) {
    eventEmitter.emit("error", e);
  }

  return eventEmitter;
};

const createThumbnail = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  return new Promise<FileInterface>((resolve, _) => {
    const eventEmitter = processData(file, filename, user);
    eventEmitter.on("error", (e) => {
      console.log("Error creating thumbnail", e);
      resolve(file);
    });
    eventEmitter.on("finish", (updatedFile: FileInterface) => {
      resolve(updatedFile);
    });
  });
};

export default createThumbnail;
