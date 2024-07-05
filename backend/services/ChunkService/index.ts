import { Response, Request } from "express";
import ChunkInterface from "./utils/ChunkInterface";
import { UserInterface } from "../../models/user";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import crypto from "crypto";
import getBusboyData from "./utils/getBusboyData";
import videoChecker from "../../utils/videoChecker";
import fs from "fs";
import uuid from "uuid";
import awaitUploadStreamFS from "./utils/awaitUploadStreamFS";
import File, { FileInterface } from "../../models/file";
import getFileSize from "./utils/getFileSize";
import DbUtilFile from "../../db/utils/fileUtils/index";
import DbUtilFolder from "../../db/utils/folderUtils/index";
import awaitStream from "./utils/awaitStream";
import createThumbnailAny from "./utils/createThumbailAny";
import imageChecker from "../../utils/imageChecker";
import Thumbnail, { ThumbnailInterface } from "../../models/thumbnail";
import streamToBuffer from "../../utils/streamToBuffer";
import User from "../../models/user";
import env from "../../enviroment/env";
import removeChunksFS from "./utils/removeChunksFS";
import getPrevIVFS from "./utils/getPrevIVFS";
import awaitStreamVideo from "./utils/awaitStreamVideo";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import Folder, { FolderInterface } from "../../models/folder";
import addToStoageSize from "./utils/addToStorageSize";
import subtractFromStorageSize from "./utils/subtractFromStorageSize";
import ForbiddenError from "../../utils/ForbiddenError";
import { ObjectId } from "mongodb";
import FolderService from "../FolderService";
import MongoFileService from "../FileService";
import createVideoThumbnailFS from "./utils/createVideoThumbnailFS";
import { S3Actions } from "./S3Actions";
import { FilesystemActions } from "./FileSystemActions";
import { createGenericParams } from "./utils/storageHelper";

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

const storageActions =
  env.dbType === "s3" ? new S3Actions() : new FilesystemActions();

class StorageService {
  constructor() {}

  uploadFile = async (user: UserInterface, busboy: any, req: Request) => {
    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    const initVect = crypto.randomBytes(16);

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);

    const { file, filename: fileInfo, formData } = await getBusboyData(busboy);

    const filename = fileInfo.filename;
    const parent = formData.get("parent") || "/";
    const size = formData.get("size") || "";
    let hasThumbnail = false;
    let thumbnailID = "";
    const isVideo = videoChecker(filename);

    const parentList = [];

    if (parent !== "/") {
      const parentFolder = await dbUtilsFolder.getFolderInfo(
        parent,
        user._id.toString()
      );
      parentList.push(...parentFolder.parentList, parentFolder._id);
    } else {
      parentList.push("/");
    }

    const randomFilenameID = uuid.v4();

    const metadata = {
      owner: user._id,
      parent,
      parentList: parentList.toString(),
      hasThumbnail,
      thumbnailID,
      isVideo,
      size,
      IV: initVect,
    } as any;

    if (env.dbType === "fs") {
      metadata.filePath = env.fsDirectory + randomFilenameID;
    } else {
      metadata.s3ID = randomFilenameID;
    }

    const fileWriteStream = storageActions.createWriteStream(
      metadata,
      file.pipe(cipher),
      randomFilenameID
    );

    return {
      cipher,
      fileWriteStream,
      metadata,
      filename,
    };
  };

  // INJECTED
  downloadFile = async (user: UserInterface, fileID: string, res: Response) => {
    const currentFile = await dbUtilsFile.getFileInfo(
      fileID,
      user._id.toString()
    );

    if (!currentFile) throw new NotFoundError("Download File Not Found");

    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    // TODO: I believe this has to do with using conn.db instead of the mongoose driver
    // We should switch to the mongoose driver
    let IV = currentFile.metadata.IV;
    if (!(IV instanceof Buffer)) {
      IV = IV.buffer;
    }

    const readStreamParams = createGenericParams({
      filePath: currentFile.metadata.filePath,
      Key: currentFile.metadata.s3ID,
    });

    const readStream = storageActions.createReadStream(readStreamParams);

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

    return {
      readStream,
      decipher,
      file: currentFile,
    };
  };

  // INJECTED
  getThumbnail = async (user: UserInterface, id: string) => {
    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    const thumbnail = (await Thumbnail.findById(
      new ObjectId(id)
    )) as ThumbnailInterface;

    if (thumbnail.owner !== user._id.toString()) {
      throw new ForbiddenError("Thumbnail Unauthorized Error");
    }

    // TODO: Fix this type
    let iv = thumbnail.IV as any;
    if (!(iv instanceof Buffer)) {
      iv = iv.buffer;
    }

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, iv);

    const readStreamParams = createGenericParams({
      filePath: thumbnail.path,
      Key: thumbnail.s3ID,
    });

    const readStream = storageActions.createReadStream(readStreamParams);

    return {
      readStream,
      decipher,
    };
  };

  // INJECTED
  getFullThumbnail = async (user: UserInterface, fileID: string) => {
    const userID = user._id;

    const file = await dbUtilsFile.getFileInfo(fileID, userID.toString());

    if (!file) throw new NotFoundError("File Thumbnail Not Found");

    const password = user.getEncryptionKey();

    // TODO: Fix this type
    let IV = file.metadata.IV as any;
    if (!(IV instanceof Buffer)) {
      IV = IV.buffer;
    }

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    const readStreamParams = createGenericParams({
      filePath: file.metadata.filePath,
      Key: file.metadata.s3ID,
    });

    const readStream = storageActions.createReadStream(readStreamParams);

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

    return {
      readStream,
      decipher,
      file,
    };
  };

  // INJECTED
  streamVideo = async (user: UserInterface, fileID: string, headers: any) => {
    const userID = user._id;
    const currentFile = await dbUtilsFile.getFileInfo(
      fileID,
      userID.toString()
    );

    if (!currentFile) throw new NotFoundError("Video File Not Found");

    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    const fileSize = currentFile.metadata.size;

    const range = headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    let start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const IV = currentFile.metadata.IV.buffer as Buffer;
    const chunksize = end - start + 1;

    let head = {
      "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    let currentIV = IV;

    let fixedStart = 0;
    let fixedEnd = currentFile.length;

    if (start === 0 && end === 1) {
      fixedStart = 0;
      fixedEnd = 15;
    } else {
      fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);
    }

    if (+start === 0) {
      fixedStart = 0;
    }

    const readStreamParams = createGenericParams({
      filePath: currentFile.metadata.filePath,
      Key: currentFile.metadata.s3ID,
    });

    if (fixedStart !== 0 && start !== 0) {
      currentIV = (await storageActions.getPrevIV(
        readStreamParams,
        fixedStart - 16
      )) as Buffer;
    }

    const readStream = storageActions.createReadStreamWithRange(
      readStreamParams,
      fixedStart,
      fixedEnd
    );

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, currentIV);

    decipher.setAutoPadding(false);

    return {
      readStream,
      decipher,
      file: currentFile,
      head,
    };
  };

  // INJECTED
  getPublicDownload = async (fileID: string, tempToken: any, res: Response) => {
    const file: FileInterface = await dbUtilsFile.getPublicFile(fileID);

    if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
      throw new NotAuthorizedError("File Not Public");
    }

    await dbUtilsFile.removeOneTimePublicLink(fileID);

    const user = (await User.findById(file.metadata.owner)) as UserInterface;

    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    // TODO: I believe this has to do with using conn.db instead of the mongoose driver
    // We should switch to the mongoose driver
    let IV = file.metadata.IV as any;
    if (!(IV instanceof Buffer)) {
      IV = IV.buffer;
    }

    const readStreamParams = createGenericParams({
      filePath: file.metadata.filePath,
      Key: file.metadata.s3ID,
    });

    const readStream = storageActions.createReadStream(readStreamParams);

    const CIPHER_KEY = crypto.createHash("sha256").update(password).digest();

    const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

    return {
      readStream,
      decipher,
      file: file,
    };
  };

  // INJECTED
  deleteMulti = async (
    userID: string,
    items: {
      type: "file" | "folder" | "quick-item";
      id: string;
      file?: FileInterface;
      folder?: FolderInterface;
    }[]
  ) => {
    const fileList = items.filter(
      (item) => item.type === "file" || item.type === "quick-item"
    );
    const folderList = items
      .filter((item) => item.type === "folder")
      .sort((a, b) => {
        if (!a.folder || !b.folder) return 0;
        return b.folder.parentList.length - a.folder.parentList.length;
      });

    for (const file of fileList) {
      await this.deleteFile(userID, file.id);
    }
    for (const folder of folderList) {
      await this.deleteFolder(userID, folder.id);
    }
  };

  // INJECTED
  deleteFile = async (userID: string, fileID: string) => {
    const file = await dbUtilsFile.getFileInfo(fileID, userID);

    if (!file) throw new NotFoundError("Delete File Not Found Error");

    if (file.metadata.thumbnailID) {
      const thumbnail = (await Thumbnail.findById(
        file.metadata.thumbnailID
      )) as ThumbnailInterface;

      const removeChunksParams = createGenericParams({
        filePath: thumbnail.path,
        Key: thumbnail.s3ID,
      });

      await storageActions.removeChunks(removeChunksParams);

      await Thumbnail.deleteOne({ _id: file.metadata.thumbnailID });
    }

    const removeChunksParams = createGenericParams({
      filePath: file.metadata.filePath,
      Key: file.metadata.s3ID,
    });

    await storageActions.removeChunks(removeChunksParams);
    await File.deleteOne({ _id: file._id });
  };

  // INJECTED
  deleteFolder = async (userID: string, folderID: string) => {
    const folder = await dbUtilsFolder.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Delete Folder Not Found Error");

    const parentList = [...folder.parentList, folder._id];

    await Folder.deleteMany({
      owner: userID,
      parentList: { $all: parentList },
    });
    await Folder.deleteMany({ owner: userID, _id: folderID });

    const fileList = await dbUtilsFile.getFileListByParent(
      userID,
      parentList.toString()
    );

    if (!fileList) throw new NotFoundError("Delete File List Not Found");

    for (let i = 0; i < fileList.length; i++) {
      const currentFile = fileList[i];

      try {
        if (currentFile.metadata.thumbnailID) {
          const thumbnail = (await Thumbnail.findById(
            currentFile.metadata.thumbnailID
          )) as ThumbnailInterface;

          const removeChunksParams = createGenericParams({
            filePath: thumbnail.path,
            Key: thumbnail.s3ID,
          });

          await storageActions.removeChunks(removeChunksParams);

          await Thumbnail.deleteOne({ _id: currentFile.metadata.thumbnailID });
        }

        const removeChunksParams = createGenericParams({
          filePath: currentFile.metadata.filePath,
          Key: currentFile.metadata.s3ID,
        });

        await storageActions.removeChunks(removeChunksParams);
        await File.deleteOne({ _id: currentFile._id });
      } catch (e) {
        console.log(
          "Could not delete file",
          currentFile.filename,
          currentFile._id
        );
      }
    }
  };

  // INJECTED
  deleteAll = async (userID: string) => {
    await Folder.deleteMany({ owner: userID });

    const fileList = await dbUtilsFile.getFileListByOwner(userID);

    if (!fileList)
      throw new NotFoundError("Delete All File List Not Found Error");

    for (let i = 0; i < fileList.length; i++) {
      const currentFile = fileList[i];

      try {
        if (currentFile.metadata.thumbnailID) {
          const thumbnail = (await Thumbnail.findById(
            currentFile.metadata.thumbnailID
          )) as ThumbnailInterface;
          const removeChunksParams = createGenericParams({
            filePath: thumbnail.path,
            Key: thumbnail.s3ID,
          });

          await storageActions.removeChunks(removeChunksParams);

          await Thumbnail.deleteOne({ _id: currentFile.metadata.thumbnailID });
        }

        const removeChunksParams = createGenericParams({
          filePath: currentFile.metadata.filePath,
          Key: currentFile.metadata.s3ID,
        });

        await storageActions.removeChunks(removeChunksParams);
        await File.deleteOne({ _id: currentFile._id });
      } catch (e) {
        console.log(
          "Could Not Remove File",
          currentFile.filename,
          currentFile._id
        );
      }
    }
  };
}

export default StorageService;
