import { EventEmitter, Stream } from "stream";
import { UserInterface } from "../../../models/user-model";
import File, {
  FileInterface,
  FileMetadateInterface,
} from "../../../models/file-model";
import uuid from "uuid";
import crypto from "crypto";
import ForbiddenError from "../../../utils/ForbiddenError";
import env from "../../../enviroment/env";
import { getStorageActions } from "../actions/helper-actions";
import getFileSize from "./getFileSize";
import imageChecker from "../../../utils/imageChecker";
import videoChecker from "../../../utils/videoChecker";
import createVideoThumbnail from "./createVideoThumbnail";
import createThumbnail from "./createImageThumbnail";
import { RequestTypeFullUser } from "../../../controllers/file-controller";
import { getFSStoragePath } from "../../../utils/getFSStoragePath";

// TODO: We should stop using moongoose directly here,
// Also in our fileDB make sure we are actually using File instead
// Of just modifying data directly so we get validation

const storageActions = getStorageActions();

type FileInfo = {
  file: FileInterface;
  parent: string;
};

const processData = (
  busboy: any,
  user: UserInterface,
  req: RequestTypeFullUser
) => {
  const eventEmitter = new EventEmitter();

  try {
    let parent = "";
    let size = 0;

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

      const videoCheck = videoChecker(filename);

      const currentFile = new File({
        filename,
        uploadDate: date.toISOString(),
        length,
        metadata: {
          ...metadata,
          isVideo: videoCheck,
        },
      });

      await currentFile.save();

      const imageCheck = imageChecker(currentFile.filename);

      if (videoCheck && env.videoThumbnailsEnabled) {
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

    const uploadFile = (filename: string, fileStream: Stream) => {
      return new Promise<{ filename: string; metadata: FileMetadateInterface }>(
        (resolve, reject) => {
          const randomFilenameID = uuid.v4();

          const password = user.getEncryptionKey();

          if (!password) throw new ForbiddenError("Invalid Encryption Key");

          const initVect = crypto.randomBytes(16);

          const CIPHER_KEY = crypto
            .createHash("sha256")
            .update(password)
            .digest();

          const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);

          const metadata = {
            owner: user._id.toString(),
            parent: "/",
            parentList: ["/"].toString(),
            hasThumbnail: false,
            thumbnailID: "",
            isVideo: false,
            size,
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
            fileStream.pipe(cipher),
            randomFilenameID
          );

          writeStream.on("error", (e: Error) => {
            reject(e);
          });

          cipher.on("error", (e: Error) => {
            reject(e);
          });

          fileStream.on("error", (e: Error) => {
            reject(e);
          });

          if (emitter) {
            emitter.on("finish", () => {
              resolve({ filename, metadata });
            });
            emitter.on("error", (e: Error) => {
              reject(e);
            });
          } else {
            writeStream.on("finish", () => {
              resolve({ filename, metadata });
            });
          }

          cipher.pipe(writeStream);
        }
      );
    };

    const processFile = async (filename: string, fileStream: Stream) => {
      try {
        const { filename: newFilename, metadata } = await uploadFile(
          filename,
          fileStream
        );
        const file = await handleFinish(newFilename, metadata);
        eventEmitter.emit("finish", {
          file,
          parent,
        });
      } catch (e) {
        eventEmitter.emit("error", e);
      }
    };

    busboy.on("field", (field: any, val: any) => {
      if (field === "parent") {
        parent = val;
      } else if (field === "size") {
        size = +val;
      }
    });

    busboy.on(
      "file",
      (
        _: string,
        file: Stream,
        filedata: {
          filename: string;
        }
      ) => {
        processFile(filedata.filename, file);
      }
    );

    busboy.on("error", (e: Error) => {
      eventEmitter.emit("error", e);
    });

    req.on("error", (e: Error) => {
      eventEmitter.emit("error", e);
    });

    req.pipe(busboy);
  } catch (e) {
    eventEmitter.emit("error", e);
  }

  return eventEmitter;
};

const uploadFileToStorage = (
  busboy: any,
  user: UserInterface,
  req: RequestTypeFullUser
) => {
  return new Promise<FileInfo>((resolve, reject) => {
    const eventEmitter = processData(busboy, user, req);
    eventEmitter.on("finish", (data) => {
      resolve(data);
    });
    eventEmitter.on("error", (e) => {
      reject(e);
    });
  });
};

export default uploadFileToStorage;
