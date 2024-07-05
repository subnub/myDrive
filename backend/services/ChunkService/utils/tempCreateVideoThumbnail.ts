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
import { S3Actions } from "../Actions/S3Actions";
import { FilesystemActions } from "../Actions/FileSystemActions";
import { createGenericParams } from "./storageHelper";

const storageActions =
  env.dbType === "s3" ? new S3Actions() : new FilesystemActions();

const tempCreateVideoThumbnail = (
  file: FileInterface,
  filename: string,
  user: UserInterface
) => {
  return new Promise<FileInterface>((resolve, reject) => {
    const thumbnailFilename = uuid.v4();
    const tempDirectory = env.fsDirectory + "temp/" + thumbnailFilename;
    const cleanup = () => {
      fs.unlink(tempDirectory, (err) => {
        if (err) console.error("CLEANUP ERROR:", err);
      });
    };

    try {
      const password = user.getEncryptionKey();

      let CIPHER_KEY = crypto.createHash("sha256").update(password!).digest();

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

      const handleError = (e: Error) => {
        console.log("thumbnail error", e);
        cleanup();
        resolve(file);
      };

      const decryptedReadStream = readStream.pipe(decipher);

      readStream.on("error", handleError);

      decipher.on("error", handleError);

      writeStream.on("error", handleError);

      thumbnailCipher.on("error", handleError);

      decryptedReadStream.on("error", handleError);

      tempWriteStream.on("error", handleError);

      decryptedReadStream.pipe(tempWriteStream, { end: true });

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

          cleanup();

          resolve(updatedFile?.toObject());
        } catch (e) {
          console.log("thumbnail error", e);
          cleanup();
          resolve(file);
        }
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
          .on("start", (command) => {})
          .on("end", async () => {
            console.log("end");
            await handleFinish();
          })
          .on("error", (err, _, stderr) => {
            console.log("error", err, stderr);
            cleanup();
            resolve(file);
          })
          .pipe(thumbnailCipher)
          .pipe(writeStream, { end: true });
      });
    } catch (e) {
      console.log("thumbnail error", e);
      cleanup();
      resolve(file);
    }
  });
};

export default tempCreateVideoThumbnail;
