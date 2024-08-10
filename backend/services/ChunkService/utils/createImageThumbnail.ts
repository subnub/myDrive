import mongoose from "../../../db/connections/mongoose";
import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail";
import sharp from "sharp";
import { FileInterface } from "../../../models/file";
import { UserInterface } from "../../../models/user";
import fs from "fs";
import uuid from "uuid";
import env from "../../../enviroment/env";
import { ObjectId } from "mongodb";
import File from "../../../models/file";
import { createGenericParams } from "./storageHelper";
import { S3Actions } from "../Actions/S3Actions";
import { FilesystemActions } from "../Actions/FileSystemActions";

const conn = mongoose.connection;

const storageActions =
  env.dbType === "s3" ? new S3Actions() : new FilesystemActions();

const createThumbnail = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  return new Promise<FileInterface>((resolve, reject) => {
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

      const writeStream = storageActions.createWriteStream(
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
        try {
          const thumbnailModel = new Thumbnail({
            name: filename,
            owner: user._id,
            IV: thumbnailIV,
            path: env.fsDirectory + thumbnailFilename,
          });

          await thumbnailModel.save();
          if (!file._id) {
            return reject();
          }
          const updateFileResponse = await File.updateOne(
            { _id: new ObjectId(file._id), "metadata.owner": user._id },
            {
              $set: {
                "metadata.hasThumbnail": true,
                "metadata.thumbnailID": thumbnailModel._id,
              },
            }
          );
          if (updateFileResponse.modifiedCount === 0) {
            return reject();
          }

          const updatedFile = await File.findById({
            _id: new ObjectId(file._id),
            "metadata.owner": user._id,
          });

          if (!updatedFile) return reject();

          resolve(updatedFile?.toObject());
        } catch (e) {
          console.log("thumbnail error", e);
          resolve(file);
        }
      };

      const handleError = (e: Error) => {
        console.log("thumbnail stream error", e);
        resolve(file);
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

      writeStream.on("finish", async () => {
        await handleFinish();
      });
    } catch (e) {
      console.log("File service upload thumbnail error", e);
      resolve(file);
    }
  });
};

export default createThumbnail;
