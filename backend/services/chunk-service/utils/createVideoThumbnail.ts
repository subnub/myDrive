import mongoose from "../../../db/connections/mongoose";
import crypto from "crypto";
import Thumbnail from "../../../models/thumbnail-model";
import sharp from "sharp";
import { FileInterface } from "../../../models/file-model";
import { UserInterface } from "../../../models/user-model";
import fs from "fs";
import uuid from "uuid";
import env from "../../../enviroment/env";
import { ObjectId } from "mongodb";
import File from "../../../models/file-model";
import ffmpeg from "fluent-ffmpeg";
import tempCreateVideoThumbnail from "./tempCreateVideoThumbnail";
import { S3Actions } from "../actions/S3-actions";
import { FilesystemActions } from "../actions/file-system-actions";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

const storageActions = getStorageActions();

const attemptToRemoveChunks = async (
  file: FileInterface,
  thumbnailFilename: string
) => {
  try {
    const readStreamParams = createGenericParams({
      filePath: getFSStoragePath() + thumbnailFilename,
      Key: thumbnailFilename,
    });
    await storageActions.removeChunks(readStreamParams);
  } catch (e) {
    console.log("error removing chunks", e);
  }
};

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

      const { writeStream, emitter } = storageActions.createWriteStream(
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

      let error = false;

      const handleFinish = async () => {
        try {
          if (error) return;

          const thumbnailModel = new Thumbnail({
            name: filename,
            owner: user._id,
            IV: thumbnailIV,
            path: getFSStoragePath() + thumbnailFilename,
            s3ID: thumbnailFilename,
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
                "metadata.isVideo": true,
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

      if (emitter) {
        emitter.on("finish", async () => {
          await handleFinish();
        });
      }

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
        .on("end", async (err) => {
          if (!emitter) {
            await handleFinish();
          }
        })
        .on("error", async (err, sdf, stderr) => {
          // console.log("thumbnail error attempting temp directory fix");

          error = true;

          await attemptToRemoveChunks(file, thumbnailFilename);

          if (env.tempDirectory && env.tempVideoThumbnailLimit > file.length) {
            const updatedFile = await tempCreateVideoThumbnail(
              file,
              filename,
              user
            );
            resolve(updatedFile);
          } else {
            resolve(file);
          }
          // resolve(file);
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
