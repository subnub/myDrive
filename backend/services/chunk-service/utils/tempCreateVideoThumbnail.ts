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
import { S3Actions } from "../actions/S3-actions";
import { FilesystemActions } from "../actions/file-system-actions";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

const storageActions = getStorageActions();

const tempCreateVideoThumbnail = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  return new Promise<FileInterface>((resolve, reject) => {
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

    const tempDirectory = env.tempDirectory + thumbnailFilename;
    const tempWriteStream = fs.createWriteStream(tempDirectory);
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

    const decryptedReadStream = readStream.pipe(decipher);

    decryptedReadStream.pipe(tempWriteStream, { end: true });

    if (emitter) {
      emitter.on("finish", async () => {
        await handleFinish();
      });
    }

    const handleFinish = async () => {
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
      const updatedFile = await File.findOneAndUpdate(
        { _id: new ObjectId(file._id), "metadata.owner": user._id },
        {
          $set: {
            "metadata.hasThumbnail": true,
            "metadata.thumbnailID": thumbnailModel._id,
            "metadata.isVideo": true,
          },
        },
        { new: true }
      );

      if (!updatedFile) return reject();

      fs.unlink(tempDirectory, (err) => {
        resolve(updatedFile);
      });
    };

    const attemptToRemoveTempDirectory = () => {
      return new Promise((resolve, reject) => {
        fs.unlink(tempDirectory, (err) => {
          resolve(!err);
        });
      });
    };

    tempWriteStream.on("finish", () => {
      ffmpeg(tempDirectory, {
        timeout: 60,
      })
        .seek(1)
        .format("image2pipe")
        .outputOptions([
          "-f image2pipe",
          "-vframes 1",
          "-vf scale='if(gt(iw,ih),600,-1):if(gt(ih,iw),300,-1)'",
        ])
        .on("start", () => {})
        .on("end", async () => {
          if (!emitter) {
            await handleFinish();
          }
        })
        .on("error", (err, _, stderr) => {
          console.log("error", err, stderr);
          attemptToRemoveTempDirectory();
          resolve(file);
        })
        .pipe(thumbnailCipher)
        .pipe(writeStream, { end: true });
    });
  });
};

export default tempCreateVideoThumbnail;
