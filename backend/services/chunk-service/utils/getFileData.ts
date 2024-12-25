import { EventEmitter } from "stream";
import { UserInterface } from "../../../models/user-model";
import e, { Response } from "express";
import ForbiddenError from "../../../utils/ForbiddenError";
import NotFoundError from "../../../utils/NotFoundError";
import crypto from "crypto";
import { createGenericParams } from "./storageHelper";
import { getStorageActions } from "../actions/helper-actions";
import FileDB from "../../../db/mongoDB/fileDB";
import { FileInterface } from "../../../models/file-model";
import NotAuthorizedError from "../../../utils/NotAuthorizedError";
import sanitizeFilename from "../../../utils/sanitizeFilename";

const fileDB = new FileDB();

const storageActions = getStorageActions();

const activeStreams = new Map<
  string,
  {
    readStream: NodeJS.ReadableStream;
    decipherStream: NodeJS.ReadableStream;
    file: FileInterface;
  }
>();

const getFileAndRemoveActiveStream = async (
  fileID: string,
  userID: string,
  isVideoStream: boolean
) => {
  const cachedFileData = activeStreams.get(fileID);
  if (!cachedFileData || !isVideoStream) {
    const file = await fileDB.getFileInfo(fileID, userID);
    if (!file) {
      throw new NotFoundError("File not found");
    }
    if (file.metadata.owner !== userID) {
      throw new NotAuthorizedError("Not owner of file");
    }
    return file;
  } else {
    const { file, readStream, decipherStream } = cachedFileData;
    try {
      activeStreams.delete(fileID);
      // @ts-ignore
      readStream.destroy();
      // @ts-ignore
      decipherStream.destroy();
    } catch (e) {
      console.log("Error destroying streams", e);
    }
    return file;
  }
};

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
      const currentFile = await getFileAndRemoveActiveStream(
        fileID,
        user._id.toString(),
        !!range
      );

      if (!currentFile) throw new NotFoundError("Download File Not Found");

      const password = user.getEncryptionKey();

      if (!password) throw new ForbiddenError("Invalid Encryption Key");

      const IV = rangeIV || currentFile.metadata.IV;

      const readStreamParams = createGenericParams({
        filePath: currentFile.metadata.filePath,
        Key: currentFile.metadata.s3ID,
      });

      let readStream: NodeJS.ReadableStream;

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

      if (!!range) {
        activeStreams.set(fileID, {
          readStream,
          decipherStream: decipher,
          file: currentFile,
        });
      }

      res.on("error", (e: Error) => {
        eventEmitter.emit("error", e);
      });

      if (!range) {
        const sanatizedFilename = sanitizeFilename(currentFile.filename);
        const encodedFilename = encodeURIComponent(sanatizedFilename);
        res.set("Content-Type", "binary/octet-stream");
        res.set(
          "Content-Disposition",
          `attachment; filename="${sanatizedFilename}"; filename*=UTF-8''${encodedFilename}`
        );
        res.set("Content-Length", currentFile.metadata.size.toString());
      }

      if (range) {
        let bytesSent = 0;

        decipher.on("data", (data: Buffer) => {
          if (bytesSent === 0 && range.skip > 0) {
            const neededData = data.slice(range.skip, data.length);
            res.write(neededData);
            bytesSent += neededData.length;
          } else if (bytesSent + data.length > range.chunksize) {
            const currentDataLength = bytesSent + data.length;
            const difference = currentDataLength - range.chunksize;
            const neededData = data.slice(0, data.length - difference);
            res.write(neededData);
            bytesSent += neededData.length;
          } else {
            res.write(data);
            bytesSent += data.length;
          }
        });

        decipher.on("finish", () => {
          res.end();

          eventEmitter.emit("finish");
        });

        readStream.pipe(decipher);
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
