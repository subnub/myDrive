import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import e, { Response } from "express";
import ForbiddenError from "../../../utils/ForbiddenError";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import FileDB from "../../../db/mongoDB/fileDB";
// @ts-ignore
import streamSkip from "stream-skip";

const fileDB = new FileDB();

const storageActions = getStorageActions();

const proccessData = (
  res: Response,
  fileID: string,
  user: UserInterface,
  rangeIV?: Buffer,
  range?: {
    start: number;
    end: number;
    fixedStart: number;
    fixedEnd: number;
    skip: number;
    chunksize: number;
  }
) => {
  const eventEmitter = new EventEmitter();

  const processFile = async () => {
    try {
      const currentFile = await fileDB.getFileInfo(fileID, user._id.toString());

      if (!currentFile) throw new NotFoundError("Download File Not Found");

      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const IV = rangeIV || currentFile.metadata.IV;

      const readStreamParams = createGenericParams({
        filePath: currentFile.metadata.filePath,
        Key: currentFile.metadata.s3ID,
      });

      let readStream;

      if (range) {
        readStream = storageActions.createReadStreamWithRange(
          readStreamParams,
          range.fixedStart,
          range.fixedEnd
        );
      } else {
        readStream = storageActions.createReadStream(readStreamParams);
      }

      const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

      const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

      if (range) {
        decipher.setAutoPadding(false);
      }

      decipher.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      readStream.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      res.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      if (!range) {
        res.set("Content-Type", "binary/octet-stream");
        res.set(
          "Content-Disposition",
          'attachment; filename="' + currentFile.filename + '"'
        );
        res.set("Content-Length", currentFile.metadata.size.toString());
      }

      if (range) {
        let bytesSent = 0;

        const skipStream = streamSkip(range.skip);

        const totalData: Buffer[] = [];
        decipher.on("data", (data: Buffer) => {
          // console.log("data", data.length);
          if (bytesSent + data.length > range.chunksize) {
            const currentDataLength = bytesSent + data.length;
            const difference = currentDataLength - range.chunksize;
            const neededData = data.slice(0, data.length - difference);
            console.log("needed data", data.length - difference);
            // console.log(
            //   "needed data",
            //   neededData.length,
            //   range.end - range.start,
            //   bytesSent
            // );
            res.write(neededData);
            totalData.push(neededData);
          } else {
            res.write(data);
            totalData.push(data);
          }
          //totalData.push(data);

          bytesSent += data.length;
        });

        readStream.pipe(decipher);
        // decipher.on("finish", () => {
        //   eventEmitter.emit("finish");
        // });
        decipher.on("finish", () => {
          // console.log("finish", totalData);
          const buffer = Buffer.concat(totalData);
          console.log("buffer", buffer.length);
          // res.write(buffer);
          res.end();

          eventEmitter.emit("finish");
        });
        // readStream
        //   .pipe(decipher)
        //   .pipe(res)
        //   .on("finish", () => {
        //     eventEmitter.emit("finish");
        //   });
      } else {
        readStream
          .pipe(decipher)
          .pipe(res)
          .on("finish", () => {
            eventEmitter.emit("finish");
          });
      }
    } catch (e) {
      eventEmitter.emit("error", e);
    }
  };

  processFile();

  return eventEmitter;
};

const getFileData = (
  res: Response,
  fileID: string,
  user: UserInterface,
  rangeIV?: Buffer,
  range?: {
    start: number;
    end: number;
    fixedStart: number;
    fixedEnd: number;
    skip: number;
    chunksize: number;
  }
) => {
  return new Promise((resolve, reject) => {
    const eventEmitter = proccessData(res, fileID, user, rangeIV, range);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default getFileData;
