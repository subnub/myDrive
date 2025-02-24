import InternalServerError from "../../utils/InternalServerError";
import NotFoundError from "../../utils/NotFoundError";
import FileDB from "../../db/mongoDB/fileDB";
import FolderDB from "../../db/mongoDB/folderDB";
import { FolderListQueryType } from "../../types/folder-types";
import UserDB from "../../db/mongoDB/userDB";

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

const fileDB = new FileDB();
const folderDB = new FolderDB();
const userDB = new UserDB();

class FolderService {
  createFolder = async (userID: string, name: string, parent: string) => {
    const newFolderParentList = [];
    if (parent !== "/") {
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

    const folder = await folderDB.createFolder(newFolderData);

    if (!folder) throw new InternalServerError("Upload Folder Error");

    return folder;
  };

  getFolderInfo = async (userID: string, folderID: string) => {
    const currentFolder = await folderDB.getFolderInfo(folderID, userID);
    if (!currentFolder) throw new NotFoundError("Folder Info Not Found Error");
    return currentFolder;
  };

  getFolderList = async (queryData: FolderListQueryType, sortBy: string) => {
    const folderList = await folderDB.getFolderList(queryData, sortBy);

    if (!folderList) throw new NotFoundError("Folder List Not Found Error");

    return folderList;
  };

  renameFolder = async (userID: string, folderID: string, title: string) => {
    const folder = await folderDB.renameFolder(folderID, userID, title);

    if (!folder) throw new NotFoundError("Rename Folder Not Found");
  };

  trashFolder = async (userID: string, folderID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Trash Folder Not Found Error");

    const parentList = [];

    if (folder.parent !== "/") {
      await folderDB.moveFolder(folderID, userID, "/", ["/"]);
      parentList.push("/", folder._id!.toString());
    } else {
      parentList.push(...folder.parentList, folder._id!.toString());
    }

    await folderDB.trashFolder(folderID, userID);

    await folderDB.trashFoldersByParent(parentList, userID);

    await fileDB.trashFilesByParent(parentList.toString(), userID);
  };

  restoreFolder = async (userID: string, folderID: string) => {
    const folder = await folderDB.restoreFolder(folderID, userID);

    if (!folder) throw new NotFoundError("Restore Folder Not Found Error");

    const parentList = [...folder.parentList, folder._id!.toString()];

    await folderDB.restoreFoldersByParent(parentList, userID);

    await fileDB.restoreFilesByParent(parentList.toString(), userID);
  };

  getMoveFolderList = async (
    userID: string,
    parent?: string,
    search?: string,
    folderIDs?: string[]
  ) => {
    const folderList = await folderDB.getMoveFolderList(
      userID,
      parent,
      search,
      folderIDs
    );

    return folderList;
  };

  moveFolder = async (userID: string, folderID: string, parentID: string) => {
    const folder = await folderDB.getFolderInfo(folderID, userID);

    if (!folder) throw new NotFoundError("Move Folder Not Found Error");

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

    await Promise.all([
      folderDB.moveFolder(folderID, userID, parentID, startParentList),
      fileDB.moveMultipleFiles(
        userID,
        folderID,
        folderID,
        [...startParentList, folderID].toString()
      ),
    ]);

    for (let i = 0; i < foldersByIncludedParent.length; i++) {
      const currentFolder = foldersByIncludedParent[i];

      const currentParentIndex = currentFolder.parentList.indexOf(folderID);

      const newParentList = [];

      newParentList.push(
        ...startParentList,
        folderID,
        ...currentFolder.parentList.slice(currentParentIndex + 1)
      );

      await Promise.all([
        folderDB.moveFolder(
          currentFolder._id.toString(),
          userID,
          currentFolder.parent,
          newParentList
        ),
        fileDB.moveMultipleFiles(
          userID,
          currentFolder._id.toString(),
          currentFolder._id.toString(),
          [...newParentList, currentFolder._id.toString()].toString()
        ),
      ]);
    }

    const updatedFolder = await folderDB.getFolderInfo(folderID, userID);

    return updatedFolder;
  };
}

export default FolderService;
