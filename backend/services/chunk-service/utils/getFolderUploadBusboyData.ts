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

type FileDataType = {
  name: string;
  size: number;
  type: string;
  path: string;
  index: number;
  file: Stream;
  uploadedFileId: string;
};

const storageActions =
  env.dbType === "s3" ? new S3Actions() : new FilesystemActions();

const getFolderBusboyData = (busboy: any, user: UserInterface) => {
  type dataType = Record<string, FileDataType>;

  return new Promise<{ fileDataMap: dataType; parent: string }>(
    (resolve, reject) => {
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
        try {
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
            const updatedFile = await createThumbnail(
              currentFile,
              filename,
              user
            );
            return updatedFile;
          } else {
            return currentFile;
          }
        } catch (e: unknown) {
          console.log("handle finish error", e);
        }
      };

      const uploadFile = (currentFile: { file: Stream; index: string }) => {
        return new Promise<FileInterface | undefined>((resolve, reject) => {
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
            metadata.filePath = env.fsDirectory + randomFilenameID;
          } else {
            metadata.s3ID = randomFilenameID;
          }

          const { writeStream, emitter } = storageActions.createWriteStream(
            metadata,
            file.pipe(cipher),
            randomFilenameID
          );

          cipher.pipe(writeStream);

          if (emitter) {
            emitter.on("finish", async () => {
              const file = await handleFinish(filename, metadata);
              resolve(file);
            });
          } else {
            writeStream.on("finish", async () => {
              const file = await handleFinish(filename, metadata);
              resolve(file);
            });
          }
        });
      };

      const processQueue = async () => {
        if (processing) return;

        processing = true;

        while (uploadQueue.length > 0) {
          const currentFile = uploadQueue.shift();
          console.log("processing file", currentFile);
          const file = await uploadFile(currentFile!);
          if (!file) {
            // TODO: Handle error
            console.log("Error uploading file");
            break;
          }

          fileDataMap[currentFile!.index] = {
            ...fileDataMap[currentFile!.index],
            uploadedFileId: file._id.toString(),
          };

          filesProcessed++;

          console.log("files processed", currentFile);

          if (filesProcessed === filesToProcess) {
            resolve({ fileDataMap, parent });
          }
        }
        processing = false;
      };

      busboy.on("field", (field: any, val: any) => {
        console.log("field", field, val);
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
        async (
          _: string,
          file: Stream,
          fileData: {
            filename: string;
          }
        ) => {
          const index = fileData.filename;
          // fileDataMap[index] = {
          //   ...fileDataMap[index],
          //   file,
          // };

          uploadQueue.push({ file, index });

          processQueue();

          // file.on("data", () => {
          //   console.log("data");
          // });

          // console.log("file data", fileData);

          // filesProcessed++;

          // if (filesProcessed === filesToProcess) {
          //   resolve(fileDataMap);
          // }
        }
      );

      busboy.on("error", (e: Error) => {
        reject(e);
      });
    }
  );
};

export default getFolderBusboyData;
