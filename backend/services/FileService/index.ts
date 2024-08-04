import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import env from "../../enviroment/env";
import jwt from "jsonwebtoken";
import Folder, { FolderInterface } from "../../models/folder";
import sortBySwitch from "../../utils/sortBySwitch";
import createQuery from "../../utils/createQuery";
import DbUtilFile from "../../db/utils/fileUtils/index";
import DbUtilFolder from "../../db/utils/folderUtils";
import { UserInterface } from "../../models/user";
import { FileInterface } from "../../models/file";
import tempStorage from "../../tempStorage/tempStorage";
import FolderService from "../FolderService";

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();
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
      await dbUtilsFile.removeOneTimePublicLink(fileID);
    }
  };

  removeLink = async (userID: string, fileID: string) => {
    const file = await dbUtilsFile.removeLink(fileID, userID);

    if (!file) throw new NotFoundError("Remove Link File Not Found Error");

    return file;
  };

  makePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await dbUtilsFile.makePublic(fileID, userID, token);

    if (!file) throw new NotFoundError("Make Public File Not Found Error");

    return { file, token };
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file = await dbUtilsFile.getPublicInfo(fileID, tempToken);

    if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
      throw new NotFoundError("Public Info Not Found");
    } else {
      return file;
    }
  };

  makeOneTimePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await dbUtilsFile.makeOneTimePublic(fileID, userID, token);

    if (!file) throw new NotFoundError("Make One Time Public Not Found Error");

    return { file, token };
  };

  getFileInfo = async (userID: string, fileID: string) => {
    let currentFile = await dbUtilsFile.getFileInfo(fileID, userID);

    if (!currentFile) throw new NotFoundError("Get File Info Not Found Error");

    const parentID = currentFile.metadata.parent;

    let parentName = "";

    if (parentID === "/") {
      parentName = "Home";
    } else {
      const parentFolder = await Folder.findOne({
        owner: userID,
        _id: parentID,
      });

      if (parentFolder) {
        parentName = parentFolder.name;
      } else {
        parentName = "Unknown";
      }
    }

    return { ...currentFile, parentName };
  };

  getQuickList = async (
    user: userAccessType | UserInterface,
    limit: number | string = 12
  ) => {
    const userID = user._id;

    const quickList = await dbUtilsFile.getQuickList(userID.toString(), +limit);

    if (!quickList) throw new NotFoundError("Quick List Not Found Error");

    return quickList;
  };

  getList = async (user: userAccessType | UserInterface, query: any) => {
    const userID = user._id;

    let searchQuery = query.search || "";
    const parent = query.parent || "/";
    let limit = query.limit || 50;
    let sortBy = query.sortBy || "DEFAULT";
    const startAt = query.startAt || undefined;
    const startAtDate = query.startAtDate || "0";
    const startAtName = query.startAtName || "";
    const storageType = query.storageType || undefined;
    const folderSearch = query.folder_search || undefined;
    const trashMode = query.trashMode === "true";
    const mediaMode = query.mediaMode === "true";
    sortBy = sortBySwitch(sortBy);
    limit = parseInt(limit);
    console.log("sortBy", sortBy, query.sortBy);

    const s3Enabled = user.s3Enabled ? true : false;

    const queryObj = createQuery(
      userID.toString(),
      parent,
      query.sortBy,
      startAt,
      startAtDate,
      searchQuery,
      s3Enabled,
      startAtName,
      storageType,
      folderSearch,
      trashMode,
      mediaMode
    );

    const fileList = await dbUtilsFile.getList(queryObj, sortBy, limit);

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

    const removedTokenUser = await dbUtilsFile.removeTempToken(
      user,
      encryptedToken
    );

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

    const fileList = await dbUtilsFile.getFileSearchList(
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

    const folderList = await dbUtilsFolder.getFolderSearchList(
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
    const trashedFile = await dbUtilsFile.trashFile(fileID, userID);
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
    const restoredFile = await dbUtilsFile.restoreFile(fileID, userID);
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
    const file = await dbUtilsFile.renameFile(fileID, userID, title);

    if (!file) throw new NotFoundError("Rename File Not Found Error");

    return file;
  };

  moveFile = async (userID: string, fileID: string, parentID: string) => {
    const file = await dbUtilsFile.getFileInfo(fileID, userID);

    if (!file) throw new NotFoundError("Move File Not Found Error");

    const newParentList = [];

    if (parentID !== "/") {
      const folder = await dbUtilsFolder.getFolderInfo(parentID, userID);

      if (!folder) throw new NotFoundError("Move Folder Not Found Error");

      newParentList.push(...folder.parentList, folder._id);
    } else {
      newParentList.push("/");
    }

    console.log("new parent list", newParentList, parentID);

    const updatedFile = await dbUtilsFile.moveFile(
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
}

export default MongoFileService;
