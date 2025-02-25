import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import env from "../../enviroment/env";
import jwt from "jsonwebtoken";
import Folder, { FolderInterface } from "../../models/folder-model";
import sortBySwitch from "../../utils/sortBySwitch";
import FileDB from "../../db/mongoDB/fileDB";
import FolderDB from "../../db/mongoDB/folderDB";
import { UserInterface } from "../../models/user-model";
import { FileInterface } from "../../models/file-model";
import tempStorage from "../../tempStorage/tempStorage";
import FolderService from "../folder-service/folder-service";
import { FileListQueryType } from "../../types/file-types";

const fileDB = new FileDB();
const folderDB = new FolderDB();
const folderService = new FolderService();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

class MongoFileService {
  constructor() {}

  removePublicOneTimeLink = async (currentFile: FileInterface) => {
    const fileID = currentFile._id;
    if (!fileID) return;

    if (currentFile.metadata.linkType === "one") {
      await fileDB.removeOneTimePublicLink(fileID);
    }
  };

  removeLink = async (userID: string, fileID: string) => {
    const file = await fileDB.removeLink(fileID, userID);

    if (!file) throw new NotFoundError("Remove Link File Not Found Error");

    return file;
  };

  makePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await fileDB.makePublic(fileID, userID, token);

    if (!file) throw new NotFoundError("Make Public File Not Found Error");

    return { file, token };
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file = await fileDB.getPublicInfo(fileID, tempToken);

    if (!file) throw new NotFoundError("Public Info Not Found");

    if (!file.metadata.link || file.metadata.link !== tempToken) {
      throw new NotAuthorizedError("Public Info Not Authorized");
    } else {
      return file;
    }
  };

  makeOneTimePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await fileDB.makeOneTimePublic(fileID, userID, token);

    if (!file) throw new NotFoundError("Make One Time Public Not Found Error");

    return { file, token };
  };

  getFileInfo = async (userID: string, fileID: string) => {
    let currentFile = await fileDB.getFileInfo(fileID, userID);

    if (!currentFile) throw new NotFoundError("Get File Info Not Found Error");

    return currentFile;
  };

  getQuickList = async (
    user: userAccessType | UserInterface,
    limit: number
  ) => {
    const userID = user._id;

    const quickList = await fileDB.getQuickList(userID.toString(), limit);

    if (!quickList) throw new NotFoundError("Quick List Not Found Error");

    return quickList;
  };

  getList = async (
    queryData: FileListQueryType,
    sortBy: string,
    limit: number
  ) => {
    const fileList = await fileDB.getList(queryData, sortBy, limit);

    if (!fileList) throw new NotFoundError("File List Not Found");

    return fileList;
  };

  getDownloadToken = async (user: UserInterface) => {
    const tempToken = await user.generateTempAuthToken();

    if (!tempToken)
      throw new NotAuthorizedError("Get Download Token Not Authorized Error");

    return tempToken;
  };

  // No longer needed left for reference

  // getDownloadTokenVideo = async(user: UserInterface, cookie: string) => {

  //     if (!cookie) throw new NotAuthorizedError("Get Download Token Video Cookie Not Authorized Error");

  //     const tempToken = await user.generateTempAuthTokenVideo(cookie);

  //     if (!tempToken) throw new NotAuthorizedError("Get Download Token Video Not Authorized Error");

  //     return tempToken;
  // }

  removeTempToken = async (
    user: UserInterface,
    tempToken: any,
    currentUUID: string
  ) => {
    const key = user.getEncryptionKey();

    const decoded = (await jwt.verify(tempToken, env.passwordAccess!)) as any;

    const publicKey = decoded.iv;

    const encryptedToken = user.encryptToken(tempToken, key, publicKey);

    const removedTokenUser = await fileDB.removeTempToken(user, encryptedToken);

    if (!removedTokenUser)
      throw new NotFoundError("Remove Temp Token User Not Found Errors");

    delete tempStorage[currentUUID];

    await removedTokenUser.save();
  };

  getSuggestedList = async (
    userID: string,
    searchQuery: any,
    trashMode: boolean,
    mediaMode: boolean
  ) => {
    searchQuery = new RegExp(searchQuery, "i");

    const fileList = await fileDB.getFileSearchList(
      userID,
      searchQuery,
      trashMode,
      mediaMode
    );

    if (!fileList) throw new NotFoundError("Suggested List Not Found Error");

    if (mediaMode) {
      return {
        fileList,
        folderList: [],
      };
    }

    const folderList = await folderDB.getFolderSearchList(
      userID,
      searchQuery,
      trashMode
    );

    if (!folderList) throw new NotFoundError("Suggested List Not Found Error");

    return {
      fileList,
      folderList,
    };
  };

  trashFile = async (userID: string, fileID: string) => {
    const file = await fileDB.getFileInfo(fileID, userID);

    if (!file) throw new NotFoundError("Trash File Not Found Error");

    let parent = file.metadata.parent;
    let parentList = file.metadata.parentList;

    if (file.metadata.parent !== "/") {
      parent = "/";
      parentList = ["/"].toString();
    }

    const trashedFile = await fileDB.trashFile(
      fileID,
      parent,
      parentList,
      userID
    );
    if (!trashedFile) throw new NotFoundError("Trash File Not Found Error");
    return trashedFile;
  };

  trashMulti = async (
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
      await this.trashFile(userID, file.id);
    }
    for (const folder of folderList) {
      await folderService.trashFolder(userID, folder.id);
    }
  };

  restoreFile = async (userID: string, fileID: string) => {
    const restoredFile = await fileDB.restoreFile(fileID, userID);
    if (!restoredFile) throw new NotFoundError("Restore File Not Found Error");
    return restoredFile;
  };

  restoreMulti = async (
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
      await this.restoreFile(userID, file.id);
    }
    for (const folder of folderList) {
      await folderService.restoreFolder(userID, folder.id);
    }
  };

  renameFile = async (userID: string, fileID: string, title: string) => {
    const file = await fileDB.renameFile(fileID, userID, title);

    if (!file) throw new NotFoundError("Rename File Not Found Error");

    return file;
  };

  moveFile = async (userID: string, fileID: string, parentID: string) => {
    const file = await fileDB.getFileInfo(fileID, userID);

    if (!file) throw new NotFoundError("Move File Not Found Error");

    const newParentList = [];

    if (parentID !== "/") {
      const folder = await folderDB.getFolderInfo(parentID, userID);

      if (!folder) throw new NotFoundError("Move Folder Not Found Error");

      newParentList.push(...folder.parentList, folder._id);
    } else {
      newParentList.push("/");
    }

    const updatedFile = await fileDB.moveFile(
      fileID,
      userID,
      parentID,
      newParentList.toString()
    );

    if (!updatedFile) {
      throw new NotFoundError("Move Updated File Not Found Error");
    }

    return updatedFile;
  };

  moveMultiFiles = async (
    userID: string,
    items: {
      type: "file" | "folder" | "quick-item";
      id: string;
      file?: FileInterface;
      folder?: FolderInterface;
    }[],
    parentID: string
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
      await this.moveFile(userID, file.id, parentID);
    }
    for (const folder of folderList) {
      await folderService.moveFolder(userID, folder.id, parentID);
    }
  };
}

export default MongoFileService;
