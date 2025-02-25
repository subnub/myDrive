import { Stream } from "stream";
import uuid from "uuid";
import { UserInterface } from "../../../models/user-model";
import File, {
  FileInterface,
  FileMetadateInterface,
} from "../../../models/file-model";
import env from "../../../enviroment/env";
import { S3Actions } from "../actions/S3-actions";
import { FilesystemActions } from "../actions/file-system-actions";
import ForbiddenError from "../../../utils/ForbiddenError";
import crypto from "crypto";
import getFileSize from "./getFileSize";
import imageChecker from "../../../utils/imageChecker";
import videoChecker from "../../../utils/videoChecker";
import createVideoThumbnail from "./createVideoThumbnail";
import createThumbnail from "./createImageThumbnail";
import { EventEmitter } from "events";
import { getStorageActions } from "../actions/helper-actions";
import { RequestTypeFullUser } from "../../../controllers/file-controller";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

type FileDataType = {
  name: string;
  size: number;
  type: string;
  path: string;
  index: number;
  file: Stream;
  uploadedFileId: string;
};

const storageActions = getStorageActions();

type dataType = Record<string, FileDataType>;

const processData = (
  busboy: any,
  user: UserInterface,
  req: RequestTypeFullUser
) => {
  const eventEmitter = new EventEmitter();

  try {
    const formData = new Map();

    let filesProcessed = 0;
    let filesToProcess = 0;
    let parent = "";

    const fileDataMap: dataType = {};

    const uploadQueue: { file: Stream; index: string }[] = [];

    let processing = false;

    const handleFinish = async (
      filename: string,
      metadata: FileMetadateInterface
    ) => {
      const date = new Date();

      let length = 0;

      if (env.dbType === "fs" && metadata.filePath) {
        length = (await getFileSize(metadata.filePath)) as number;
      } else {
        // TODO: Fix this we should be using the encrypted file size
        length = metadata.size;
      }

      const currentFile = new File({
        filename,
        uploadDate: date.toISOString(),
        length,
        metadata,
      });

      await currentFile.save();

      const imageCheck = imageChecker(currentFile.filename);
      const videoCheck = videoChecker(currentFile.filename);

      if (videoCheck) {
        const updatedFile = await createVideoThumbnail(
          currentFile,
          filename,
          user
        );
        return updatedFile;
      } else if (currentFile.length < 15728640 && imageCheck) {
        const updatedFile = await createThumbnail(currentFile, filename, user);
        return updatedFile;
      } else {
        return currentFile;
      }
    };

    const uploadFile = (currentFile: { file: Stream; index: string }) => {
      return new Promise<{ filename: string; metadata: FileMetadateInterface }>(
        (resolve, reject) => {
          const { file, index } = currentFile;

          const fileData = fileDataMap[index];

          const randomFilenameID = uuid.v4();

          const password = user.getEncryptionKey();

          if (!password) throw new ForbiddenError("Invalid Encryption Key");

          const initVect = crypto.randomBytes(16);

          const CIPHER_KEY = crypto
            .createHash("sha256")
            .update(password)
            .digest();

          const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);

          const filename = fileData.name;
          const fileSize = fileData.size;

          const metadata = {
            owner: user._id.toString(),
            parent: "/",
            parentList: ["/"].toString(),
            hasThumbnail: false,
            thumbnailID: "",
            isVideo: false,
            size: fileSize,
            IV: initVect,
            processingFile: true,
          } as FileMetadateInterface;

          if (env.dbType === "fs") {
            metadata.filePath = getFSStoragePath() + randomFilenameID;
          } else {
            metadata.s3ID = randomFilenameID;
          }

          const { writeStream, emitter } = storageActions.createWriteStream(
            metadata,
            file.pipe(cipher),
            randomFilenameID
          );

          writeStream.on("error", (e: Error) => {
            reject(e);
          });

          cipher.on("error", (e: Error) => {
            reject(e);
          });

          cipher.pipe(writeStream);

          if (emitter) {
            emitter.on("finish", () => {
              resolve({ filename, metadata });
            });
          } else {
            writeStream.on("finish", () => {
              resolve({ filename, metadata });
            });
          }
        }
      );
    };

    const processQueue = async () => {
      if (processing) return;

      processing = true;

      try {
        while (uploadQueue.length > 0) {
          const currentFile = uploadQueue.shift();
          const { filename, metadata } = await uploadFile(currentFile!);
          const file = await handleFinish(filename, metadata);

          fileDataMap[currentFile!.index] = {
            ...fileDataMap[currentFile!.index],
            uploadedFileId: file._id!.toString(),
          };

          filesProcessed++;

          if (filesProcessed === filesToProcess) {
            eventEmitter.emit("finish", { fileDataMap, parent });
          }
        }
      } catch (e) {
        eventEmitter.emit("error", e);
      }

      processing = false;
    };

    busboy.on("field", (field: any, val: any) => {
      if (typeof val !== "string" || val !== "undefined") {
        formData.set(field, val);
        if (field === "file-data") {
          const fileData = JSON.parse(val);
          fileDataMap[fileData.index] = fileData;
        }
        if (field === "total-files") {
          filesToProcess = +val;
        }
        if (field === "parent") {
          parent = val;
        }
      }
    });

    busboy.on(
      "file",
      (
        _: string,
        file: Stream,
        fileData: {
          filename: string;
        }
      ) => {
        const index = fileData.filename;

        uploadQueue.push({ file, index });

        processQueue();
      }
    );

    busboy.on("error", (e: Error) => {
      eventEmitter.emit("error", e);
    });

    req.on("error", (e: Error) => {
      eventEmitter.emit("error", e);
    });

    busboy.on("error", (e: Error) => {
      eventEmitter.emit("error", e);
    });

    req.pipe(busboy);
  } catch (e) {
    eventEmitter.emit("error", e);
  }

  return eventEmitter;
};

const getFolderBusboyData = (
  busboy: any,
  user: UserInterface,
  req: RequestTypeFullUser
) => {
  return new Promise<{ fileDataMap: dataType; parent: string }>(
    (resolve, reject) => {
      const fileEventEmitter = processData(busboy, user, req);
      fileEventEmitter.on("finish", (data) => {
        resolve(data);
      });
      fileEventEmitter.on("error", (e) => {
        reject(e);
      });
    }
  );
};

export default getFolderBusboyData;
