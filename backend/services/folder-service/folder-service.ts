import Folder, { FolderInterface } from "../../models/folder-model";
import InternalServerError from "../../utils/InternalServerError";
import NotFoundError from "../../utils/NotFoundError";
import FileDB from "../../db/mongoDB/fileDB";
import FolderDB from "../../db/mongoDB/folderDB";
import sortBySwitch from "../../utils/sortBySwitchFolder";
import { UserInterface } from "../../models/user-model";

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

const fileDB = new FileDB();
const folderDB = new FolderDB();

class FolderService {
  createFolder = async (userID: string, name: string, parent: string) => {
    const newFolderParentList = [];
    if (parent && parent !== "/") {
      const parentFolder = await folderDB.getFolderInfo(parent, userID);

      if (!parentFolder) throw new Error("Parent not found");
      newFolderParentList.push(
        ...parentFolder.parentList,
        parentFolder._id?.toString()
      );
    } else {
      newFolderParentList.push("/");
    }
    const newFolderData = {
      name,
      parent: parent || "/",
      parentList: newFolderParentList,
      owner: userID,
    };
    const folder = new Folder(newFolderData);

    await folder.save();

    if (!folder) throw new InternalServerError("Upload Folder Error");

    return folder;
  };

  getFolderInfo = async (userID: string, folderID: string) => {
    const currentFolder = await folderDB.getFolderInfo(folderID, userID);
    if (!currentFolder) throw new NotFoundError("Folder Info Not Found Error");
    return currentFolder;
  };

  getFolderSublist = async (userID: string, folderID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Folder Sublist Not Found Error");

    const subfolderList = folder.parentList;

    let folderIDList = [];
    let folderNameList = [];

    for (let i = 0; i < subfolderList.length; i++) {
      const currentSubFolderID = subfolderList[i];

      if (currentSubFolderID === "/") {
        folderIDList.push("/");
        folderNameList.push("Home");
      } else {
        const currentFolder = await folderDB.getFolderInfo(
          currentSubFolderID,
          userID
        );

        if (!currentFolder) throw new NotFoundError("Folder Info Not Found");

        folderIDList.push(currentFolder._id);
        folderNameList.push(currentFolder.name);
      }
    }

    folderIDList.push(folderID);
    folderNameList.push(folder.name);

    return {
      folderIDList,
      folderNameList,
    };
  };

  getFolderList = async (user: userAccessType | UserInterface, query: any) => {
    const userID = user._id;

    let searchQuery = query.search || "";
    const parent = query.parent || "/";
    let sortBy = query.sortBy || "DEFAULT";
    const type = query.type;
    const storageType = query.storageType || undefined;
    const folderSearch = query.folder_search || undefined;
    const itemType = query.itemType || undefined;
    const trashMode = query.trashMode === "true";
    sortBy = sortBySwitch(sortBy);

    const s3Enabled = user.s3Enabled ? true : false;

    if (searchQuery.length === 0) {
      const folderList = await folderDB.getFolderListByParent(
        userID.toString(),
        parent,
        sortBy,
        s3Enabled,
        type,
        storageType,
        itemType,
        trashMode
      );

      if (!folderList) throw new NotFoundError("Folder List Not Found Error");

      return folderList;
    } else {
      searchQuery = new RegExp(searchQuery, "i");
      const folderList = await folderDB.getFolderListBySearch(
        userID.toString(),
        searchQuery,
        sortBy,
        type,
        parent,
        storageType,
        folderSearch,
        itemType,
        s3Enabled,
        trashMode
      );

      if (!folderList) throw new NotFoundError("Folder List Not Found Error");

      return folderList;
    }
  };

  renameFolder = async (userID: string, folderID: string, title: string) => {
    const folder = await folderDB.renameFolder(folderID, userID, title);

    if (!folder) throw new NotFoundError("Rename Folder Not Found");
  };

  getSubfolderFullList = async (user: userAccessType, id: string) => {
    const userID = user._id;

    const folder = await folderDB.getFolderInfo(id, userID);

    if (!folder) throw new NotFoundError("Folder Info Not Found");

    const subFolders = await this.getFolderList(user, { parent: id }); //folderService.getFolderList(user._id, {parent: id})

    let folderList: any[] = [];

    const rootID = "/";

    let currentID = folder.parent;

    folderList.push({
      _id: folder._id,
      parent: folder._id,
      name: folder.name,
      subFolders: subFolders,
    });

    while (true) {
      if (rootID === currentID) break;

      const currentFolder = await this.getFolderInfo(userID, currentID);
      const currentSubFolders = await this.getFolderList(user, {
        parent: currentFolder._id,
      });

      folderList.splice(0, 0, {
        _id: currentFolder._id,
        parent: currentFolder._id,
        name: currentFolder.name,
        subFolders: currentSubFolders,
      });

      currentID = currentFolder.parent;
    }

    return folderList;
  };

  trashFolder = async (userID: string, folderID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Trash Folder Not Found Error");

    folder.trashed = true;
    await folder.save();

    const parentList = [...folder.parentList, folder._id!.toString()];

    await folderDB.trashFoldersByParent(parentList, userID);

    await fileDB.trashFilesByParent(parentList.toString(), userID);
  };

  restoreFolder = async (userID: string, folderID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Restore Folder Not Found Error");

    folder.trashed = null;
    await folder.save();

    const parentList = [...folder.parentList, folder._id!.toString()];

    await folderDB.restoreFoldersByParent(parentList, userID);

    await fileDB.restoreFilesByParent(parentList.toString(), userID);
  };

  renameFolder2 = async (folderID: string, userID: string, title: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Rename Folder Not Found");

    folder.name = title;

    await folder.save();
  };

  getMoveFolderList = async (
    userID: string,
    parent?: string,
    search?: string,
    folderID?: string,
    currentParent?: string
  ) => {
    const folderList = await folderDB.getMoveFolderList(
      userID,
      parent,
      search,
      folderID,
      currentParent
    );

    return folderList;
  };

  moveFolder = async (userID: string, folderID: string, parentID: string) => {
    const foldersByIncludedParent =
      await folderDB.getFolderListByIncludedParent(userID, folderID);

    const startParentList = [];

    if (parentID !== "/") {
      const folderToMoveTo = await folderDB.getFolderInfo(parentID, userID);
      if (!folderToMoveTo) {
        throw new NotFoundError("Move Folder Not Found Error");
      }
      startParentList.push(
        ...folderToMoveTo.parentList,
        folderToMoveTo._id.toString()
      );
    } else {
      startParentList.push("/");
    }

    for (let i = 0; i < foldersByIncludedParent.length; i++) {
      const currentFolder = foldersByIncludedParent[i];

      const currentParentIndex = currentFolder.parentList.indexOf(folderID);

      const newParentList = [];

      newParentList.push(
        ...startParentList,
        ...currentFolder.parentList.slice(currentParentIndex + 1)
      );

      await Promise.all([
        folderDB.moveFolder(folderID, userID, parentID, newParentList),
        fileDB.moveMultipleFiles(
          userID,
          currentFolder._id.toString(),
          parentID,
          newParentList.toString()
        ),
      ]);
    }
  };
}

export default FolderService;
