import mongoose from "../../../db/mongoose";
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
import ffmpeg from "fluent-ffmpeg";
import tempCreateVideoThumbnailFS from "./tempCreateVideoThumbnailFS";
import { S3Actions } from "../S3Actions";
import { FilesystemActions } from "../FileSystemActions";
import { createGenericParams } from "./storageHelper";

const storageActions =
  env.dbType === "s3" ? new S3Actions() : new FilesystemActions();

const createVideoThumbnail = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  return new Promise<FileInterface>((resolve, reject) => {
    try {
      const password = user.getEncryptionKey();

      let CIPHER_KEY = crypto.createHash("sha256").update(password!).digest();

      const thumbnailFilename = uuid.v4();

      const readStreamParams = createGenericParams({
        filePath: file.metadata.filePath,
        Key: file.metadata.s3ID,
      });

      const readStream = storageActions.createReadStream(readStreamParams);

      const writeStream = storageActions.createWriteStream(
        readStreamParams,
        readStream,
        thumbnailFilename
      );

      const decipher = crypto.createDecipheriv(
        "aes256",
        CIPHER_KEY,
        file.metadata.IV
      );

      const thumbnailIV = crypto.randomBytes(16);

      const thumbnailCipher = crypto.createCipheriv(
        "aes256",
        CIPHER_KEY,
        thumbnailIV
      );

      const handleError = (e: Error) => {
        console.log("thumbnail stream error", e);
        resolve(file);
      };

      readStream.on("error", handleError);

      decipher.on("error", handleError);

      writeStream.on("error", handleError);

      thumbnailCipher.on("error", handleError);

      const decryptedReadStream = readStream.pipe(decipher);

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

          console.log("updated file", updatedFile, resolve);

          resolve(updatedFile?.toObject());
        } catch (e) {
          console.log("thumbnail error", e);
          resolve(file);
        }
      };

      ffmpeg(decryptedReadStream, {
        timeout: 60,
      })
        .seek(1)
        .format("image2pipe")
        .outputOptions([
          "-f image2pipe",
          "-vframes 1",
          "-vf scale='if(gt(iw,ih),600,-1):if(gt(ih,iw),300,-1)'",
        ])
        .on("start", (command) => {})
        .on("end", async () => {
          await handleFinish();
        })
        .on("error", async (err, _, stderr) => {
          console.log("thumbnail error attempting temp directory fix");
          if (env.tempDirectory) {
            const updatedFile = await tempCreateVideoThumbnailFS(
              file,
              filename,
              user
            );
            resolve(updatedFile);
          } else {
            resolve(file);
          }
        })
        .pipe(thumbnailCipher)
        .pipe(writeStream, { end: true });
    } catch (e) {
      console.log("thumbnail error", e);
      resolve(file);
    }
  });
};

export default createVideoThumbnail;
