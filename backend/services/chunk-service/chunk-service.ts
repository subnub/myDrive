import { Response, Request, NextFunction } from "express";
import { UserInterface } from "../../models/user-model";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import crypto from "crypto";
import uploadFileToStorage from "./utils/getBusboyData";
import videoChecker from "../../utils/videoChecker";
import uuid from "uuid";
import { FileInterface, FileMetadateInterface } from "../../models/file-model";
import FileDB from "../../db/mongoDB/fileDB";
import FolderDB from "../../db/mongoDB/folderDB";
import env from "../../enviroment/env";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import { FolderInterface } from "../../models/folder-model";
import ForbiddenError from "../../utils/ForbiddenError";
import { S3Actions } from "./actions/S3-actions";
import { FilesystemActions } from "./actions/file-system-actions";
import { createGenericParams } from "./utils/storageHelper";
import { Readable } from "stream";
import ThumbnailDB from "../../db/mongoDB/thumbnailDB";
import UserDB from "../../db/mongoDB/userDB";
import fixEndChunkLength from "./utils/fixEndChunkLength";
import archiver from "archiver";
import async from "async";
import getFolderBusboyData from "./utils/getFolderUploadBusboyData";
import { getStorageActions } from "./actions/helper-actions";
import getThumbnailData from "./utils/getThumbnailData";
import getFileData from "./utils/getFileData";
import getPublicFileData from "./utils/getPublicFileData";

const fileDB = new FileDB();
const folderDB = new FolderDB();
const thumbnailDB = new ThumbnailDB();
const userDB = new UserDB();

const storageActions = getStorageActions();

class StorageService {
  constructor() {}

  uploadFile = async (user: UserInterface, busboy: any, req: Request) => {
    const { parent, file } = await uploadFileToStorage(busboy, user, req);

    const parentList = [];

    if (parent !== "/") {
      const parentFolder = await folderDB.getFolderInfo(
        parent,
        user._id.toString()
      );
      if (!parentFolder) throw new NotFoundError("Parent Folder Not Found");
      parentList.push(...parentFolder.parentList, parentFolder._id);
    } else {
      parentList.push("/");
    }

    await fileDB.updateFileUploadedFile(
      file._id!.toString(),
      user._id.toString(),
      parent,
      parentList.toString()
    );

    return file;
  };

  uploadFolder = async (user: UserInterface, busboy: any, req: Request) => {
    const { fileDataMap, parent } = await getFolderBusboyData(
      busboy,
      user,
      req
    );

    const keys = Object.keys(fileDataMap);

    const folderPathsToCreate: Record<string, boolean> = {};

    const parentList = [];

    if (parent !== "/") {
      const parentFolder = await folderDB.getFolderInfo(
        parent,
        user._id.toString()
      );
      if (!parentFolder) throw new NotFoundError("Parent Folder Not Found");
      parentList.push(...parentFolder.parentList, parentFolder._id.toString());
    } else {
      parentList.push("/");
    }

    const parentName = fileDataMap[keys[0]].path.split("/")[0];

    const rootFolder = await folderDB.createFolder({
      name: parentName,
      parent: parentList[parentList.length - 1],
      owner: user._id.toString(),
      parentList: parentList,
    });

    parentList.push(rootFolder._id.toString());

    for (const key of keys) {
      const pathSplit = fileDataMap[key].path.split("/");
      const path = pathSplit.slice(1, pathSplit.length - 1).join("/");

      if (path && !folderPathsToCreate[path]) {
        folderPathsToCreate[path] = true;
      }
    }

    const sortedFolderPaths = Object.keys(folderPathsToCreate).sort();

    const foldersCreated: Record<string, FolderInterface> = {};
    for (const folderPath of sortedFolderPaths) {
      const tempParentList = [];
      const subFolders = folderPath.split("/");

      for (let i = 0; i < subFolders.length; i++) {
        const parentDirectory = subFolders.slice(0, i).join("/");
        if (tempParentList.length === 0) {
          tempParentList.push(...parentList);
        }

        if (parentDirectory && foldersCreated[parentDirectory]) {
          tempParentList.push(
            foldersCreated[parentDirectory]._id!.toString()
          );
        }

        const folderToCreate = subFolders[i];
        const tmpPath = (parentDirectory)
          ? [parentDirectory, folderToCreate].join("/")
          : folderToCreate;

        if (foldersCreated[tmpPath]) {
          continue;
        }

        const folder = await folderDB.createFolder({
          name: folderToCreate,
          parent: tempParentList[tempParentList.length - 1],
          owner: user._id.toString(),
          parentList: tempParentList,
        });

        foldersCreated[tmpPath] = folder;
      }
    }

    for (const key of keys) {
      const currentFile = fileDataMap[key];
      const parentSplit = currentFile.path.split("/");
      const parentDirectory = parentSplit
        .slice(1, parentSplit.length - 1)
        .join("/");

      const currentParent = (parentDirectory && foldersCreated[parentDirectory])
        ? foldersCreated[parentDirectory] : rootFolder;

      await fileDB.updateFolderUploadedFile(
        currentFile.uploadedFileId,
        user._id.toString(),
        currentParent._id!.toString(),
        [...currentParent.parentList, currentParent._id!.toString()].toString()
      );
    }
  };

  downloadFile = async (user: UserInterface, fileID: string, res: Response) => {
    await getFileData(res, fileID, user);
  };

  downloadZip = async (
    userID: string,
    folderIDs: string[],
    fileIDs: string[],
    res: Response
  ) => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const user = await userDB.getUserInfo(userID);

    if (!user) throw new NotFoundError("User Not Found");

    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    res.set("Content-Type", "application/zip");
    res.set(
      "Content-Disposition",
      `attachment; filename="myDrive-${new Date().toISOString()}.zip"`
    );

    archive.on("error", (e: Error) => {
      console.log("archive error", e);
    });

    archive.pipe(res);

    const parentInfoMap = new Map<string, { name: string }>();
    const previouslyUsedFileNames = new Map<string, number>();

    const getParentInfo = async (parentID: string) => {
      if (parentInfoMap.has(parentID)) {
        return parentInfoMap.get(parentID)!;
      }

      const parentFolder = await folderDB.getFolderInfo(parentID, userID);

      if (!parentFolder) {
        throw new NotFoundError("Parent Folder Not Found Error");
      }

      parentInfoMap.set(parentID, {
        name: parentFolder.name,
      });

      return parentInfoMap.get(parentID)!;
    };

    const getFileName = (file: FileInterface, parentID: string) => {
      const key = `${parentID}/${file.filename}`;

      if (!previouslyUsedFileNames.has(key)) {
        previouslyUsedFileNames.set(key, 1);
        return file.filename;
      } else {
        const counter = previouslyUsedFileNames.get(key)!;
        const extensionSplit = file.filename.split(".");
        const extension = extensionSplit[extensionSplit.length - 1];

        const filenameWithoutExtension = extensionSplit.slice(0, -1).join(".");

        previouslyUsedFileNames.set(key, +counter + 1);

        return `${filenameWithoutExtension}-${counter}${
          extension ? `.${extension}` : ""
        }`;
      }
    };

    const formatName = (name: string) => {
      return name.replace(/[/\\?%*:|"<>]/g, "-").trim();
    };

    const processFile = async (file: FileInterface, directory: string) => {
      return new Promise<void>((resolve, reject) => {
        const IV = file.metadata.IV;

        const readStreamParams = createGenericParams({
          filePath: file.metadata.filePath,
          Key: file.metadata.s3ID,
        });

        const readStream = storageActions.createReadStream(readStreamParams);

        readStream.on("error", reject);

        const CIPHER_KEY = crypto
          .createHash("sha256")
          .update(password)
          .digest();

        const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, IV);

        decipher.on("error", reject);

        archive.append(readStream.pipe(decipher), { name: directory });

        readStream.on("end", () => {
          resolve();
        });
      });
    };

    const queue = async.queue(async (task: Function, callback: Function) => {
      try {
        await task();
        callback();
      } catch (e) {
        console.log("queue error", e);
      }
    }, 4);

    for (const folderID of folderIDs) {
      queue.push(async () => {
        const folder = await folderDB.getFolderInfo(folderID, userID);

        if (!folder) throw new NotFoundError("Folder Info Not Found Error");

        const parentList = [...folder.parentList, folder._id];

        const files = await fileDB.getFileListByIncludedParent(
          userID,
          parentList.toString()
        );

        for (const file of files) {
          const fileParent = await folderDB.getFolderInfo(
            file.metadata.parent,
            userID
          );

          if (!fileParent)
            throw new NotFoundError("File Parent Not Found Error");

          let directory = "";

          const parentSplit = file.metadata.parentList.split(",");

          for (const parent of parentSplit) {
            if (parent === "/") continue;

            const parentInfo = await getParentInfo(parent);

            directory += formatName(parentInfo.name) + "/";
          }

          const fileName = formatName(getFileName(file, file.metadata.parent));

          directory += fileName;

          await processFile(file, directory);
        }
      });
    }

    for (const fileID of fileIDs) {
      queue.push(async () => {
        const file = await fileDB.getFileInfo(fileID, userID);

        if (!file) throw new NotFoundError("File Info Not Found Error");

        const fileName = formatName(getFileName(file, "/"));

        await processFile(file, fileName);
      });
    }

    await queue.drain();
    archive.finalize();

    return { archive };
  };

  getThumbnail = async (user: UserInterface, id: string, res: Response) => {
    await getThumbnailData(res, id, user);
  };

  getFullThumbnail = async (
    user: UserInterface,
    fileID: string,
    res: Response
  ) => {
    await getFileData(res, fileID, user);
  };

  streamVideo = async (
    user: UserInterface,
    fileID: string,
    headers: any,
    res: Response
  ) => {
    const userID = user._id;
    const currentFile = await fileDB.getFileInfo(fileID, userID.toString());

    if (!currentFile) throw new NotFoundError("Video File Not Found");

    const password = user.getEncryptionKey();

    if (!password) throw new ForbiddenError("Invalid Encryption Key");

    const fileSize = currentFile.metadata.size;

    const range = headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const IV = currentFile.metadata.IV;

    const head = {
      "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    let fixedStart = 0;
    let fixedEnd = fixEndChunkLength(end) - 1;

    if (start === 0 && end === 1) {
      fixedStart = 0;
      fixedEnd = 15;
    } else {
      fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);
    }

    if (+start === 0) {
      fixedStart = 0;
    }

    let currentIV = IV;

    if (fixedStart !== 0 && start !== 0) {
      const readStreamParams = createGenericParams({
        filePath: currentFile.metadata.filePath,
        Key: currentFile.metadata.s3ID,
      });
      currentIV = (await storageActions.getPrevIV(
        readStreamParams,
        fixedStart - 16
      )) as Buffer;
    }

    res.writeHead(206, head);

    await getFileData(res, fileID, user, currentIV, {
      start: start,
      end,
      chunksize,
      fixedStart,
      fixedEnd,
      skip: start - fixedStart,
    });
  };

  getPublicDownload = async (fileID: string, tempToken: any, res: Response) => {
    await getPublicFileData(res, fileID, tempToken);
  };

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

  deleteFile = async (userID: string, fileID: string) => {
    const file = await fileDB.getFileInfo(fileID, userID);

    if (!file) throw new NotFoundError("Delete File Not Found Error");

    if (file.metadata.thumbnailID) {
      const thumbnail = await thumbnailDB.getThumbnailInfo(
        userID,
        file.metadata.thumbnailID
      );

      if (!thumbnail) throw new NotFoundError("Thumbnail Not Found");

      const removeChunksParams = createGenericParams({
        filePath: thumbnail.path,
        Key: thumbnail.s3ID,
      });

      await storageActions.removeChunks(removeChunksParams);

      await thumbnailDB.removeThumbnail(userID, thumbnail._id);
    }

    const removeChunksParams = createGenericParams({
      filePath: file.metadata.filePath,
      Key: file.metadata.s3ID,
    });

    await storageActions.removeChunks(removeChunksParams);
    await fileDB.deleteFile(fileID, userID);
  };

  deleteFolder = async (userID: string, folderID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Delete Folder Not Found Error");

    const parentList = [...folder.parentList, folder._id];

    await folderDB.deleteFoldersByParentList(parentList, userID);
    await folderDB.deleteFolder(folderID, userID);

    const fileList = await fileDB.getFileListByIncludedParent(
      userID,
      parentList.toString()
    );

    if (!fileList) throw new NotFoundError("Delete File List Not Found");

    for (let i = 0; i < fileList.length; i++) {
      const currentFile = fileList[i];

      try {
        if (currentFile.metadata.thumbnailID) {
          const thumbnail = await thumbnailDB.getThumbnailInfo(
            userID,
            currentFile.metadata.thumbnailID
          );

          if (!thumbnail) throw new NotFoundError("Thumbnail Not Found");

          const removeChunksParams = createGenericParams({
            filePath: thumbnail.path,
            Key: thumbnail.s3ID,
          });

          await storageActions.removeChunks(removeChunksParams);

          await thumbnailDB.removeThumbnail(userID, thumbnail._id);
        }

        const removeChunksParams = createGenericParams({
          filePath: currentFile.metadata.filePath,
          Key: currentFile.metadata.s3ID,
        });

        await storageActions.removeChunks(removeChunksParams);
        await fileDB.deleteFile(currentFile._id.toString(), userID);
      } catch (e) {
        console.log(
          "Could not delete file",
          currentFile.filename,
          currentFile._id
        );
      }
    }
  };

  deleteAll = async (userID: string) => {
    await folderDB.deleteFoldersByOwner(userID);

    const fileList = await fileDB.getFileListByOwner(userID);

    if (!fileList)
      throw new NotFoundError("Delete All File List Not Found Error");

    for (let i = 0; i < fileList.length; i++) {
      const currentFile = fileList[i];

      try {
        if (currentFile.metadata.thumbnailID) {
          const thumbnail = await thumbnailDB.getThumbnailInfo(
            userID,
            currentFile.metadata.thumbnailID
          );

          if (!thumbnail) throw new NotFoundError("Thumbnail Not Found");

          const removeChunksParams = createGenericParams({
            filePath: thumbnail.path,
            Key: thumbnail.s3ID,
          });

          await storageActions.removeChunks(removeChunksParams);

          await thumbnailDB.removeThumbnail(userID, thumbnail._id);
        }

        const removeChunksParams = createGenericParams({
          filePath: currentFile.metadata.filePath,
          Key: currentFile.metadata.s3ID,
        });

        await storageActions.removeChunks(removeChunksParams);
        await fileDB.deleteFile(currentFile._id.toString(), userID);
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
