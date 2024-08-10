import Folder, { FolderInterface } from "../../models/folder";
import { ObjectId } from "mongodb";

class DbUtil {
  constructor() {}

  getFolderSearchList = async (
    userID: string,
    searchQuery: RegExp,
    trashMode: boolean
  ) => {
    let query: any = {
      owner: userID,
      name: searchQuery,
      trashed: trashMode ? true : null,
    };

    const folderList = await Folder.find(query).limit(10);

    return folderList;
  };

  getFolderInfo = async (folderID: string, userID: string) => {
    const folder = await Folder.findOne({
      owner: userID,
      _id: new ObjectId(folderID),
    });

    return folder;
  };

  getFolderListByParent = async (
    userID: string,
    parent: string,
    sortBy: string,
    s3Enabled: boolean,
    type: string,
    storageType: string,
    itemType: string,
    trashMode: boolean
  ) => {
    let query: any = { owner: userID, parent: parent };

    if (!s3Enabled) {
      query = { ...query, personalFolder: null };
    }

    if (type) {
      if (type === "mongo") {
        query = { ...query, personalFolder: null };
      } else if (type === "s3") {
        query = { ...query, personalFolder: true };
      }
    }

    if (itemType) {
      if (itemType === "personal") query = { ...query, personalFolder: true };
      if (itemType === "nonpersonal")
        query = { ...query, personalFolder: null };
    }

    if (trashMode) {
      query = { ...query, trashed: true };
    } else {
      query = { ...query, trashed: null };
    }

    const folderList = await Folder.find(query).sort(sortBy);

    return folderList;
  };

  getFolderListBySearch = async (
    userID: string,
    searchQuery: string,
    sortBy: string,
    type: string,
    parent: string,
    storageType: string,
    folderSearch: boolean,
    itemType: string,
    s3Enabled: boolean,
    trashMode: boolean
  ) => {
    let query: any = { name: searchQuery, owner: userID };

    if (type) {
      if (type === "mongo") {
        query = { ...query, personalFolder: null };
      } else {
        query = { ...query, personalFolder: true };
      }
    }

    if (storageType === "s3") {
      query = { ...query, personalFolder: true };
    }

    if (parent && (parent !== "/" || folderSearch)) {
      query = { ...query, parent };
    }

    if (!s3Enabled) {
      query = { ...query, personalFolder: null };
    }

    if (itemType) {
      if (itemType === "personal") query = { ...query, personalFolder: true };
      if (itemType === "nonpersonal")
        query = { ...query, personalFolder: null };
    }

    if (trashMode) {
      query = { ...query, trashed: true };
    } else {
      query = { ...query, trashed: null };
    }

    const folderList = await Folder.find(query).sort(sortBy);

    return folderList;
  };

  moveFolder = async (
    folderID: string,
    userID: string,
    parent: string,
    parentList: string[]
  ) => {
    const folder = (await Folder.findOneAndUpdate(
      { _id: new ObjectId(folderID), owner: userID },
      { $set: { parent: parent, parentList: parentList }, new: true }
    )) as FolderInterface;

    return folder;
  };

  renameFolder = async (folderID: string, userID: string, title: string) => {
    const folder = await Folder.findOneAndUpdate(
      { _id: new ObjectId(folderID), owner: userID },
      { $set: { name: title } }
    );

    return folder;
  };

  findAllFoldersByParent = async (parentID: string, userID: string) => {
    const folderList = await Folder.find({
      parentList: parentID,
      owner: userID,
    });

    return folderList;
  };

  trashFoldersByParent = async (parentList: string[], userID: string) => {
    const result = await Folder.updateMany(
      {
        owner: userID,
        parentList: { $all: parentList },
      },
      {
        $set: {
          trashed: true,
        },
      }
    );
    return result;
  };

  restoreFoldersByParent = async (parentList: string[], userID: string) => {
    const result = await Folder.updateMany(
      {
        owner: userID,
        parentList: { $all: parentList },
      },
      {
        $set: {
          trashed: null,
        },
      }
    );
    return result;
  };

  getMoveFolderList = async (
    userID: string,
    parent = "/",
    search?: string,
    folderID?: string,
    currentParent?: string
  ) => {
    let query: any = {
      owner: userID,
    };

    const idQuery = [];

    // if (currentParent && currentParent !== "/") {
    //   idQuery.push(currentParent);
    // }

    if (folderID) {
      query.parentList = { $ne: folderID };
      idQuery.push(folderID);
    }

    query._id = { $nin: idQuery };

    if (!search || search === "") {
      query.parent = parent;
    }

    if (search && search !== "") {
      query.name = new RegExp(search, "i");
    }

    const result = await Folder.find(query).sort({ createdAt: -1 });

    return result;
  };

  getFolderListByIncludedParent = async (userID: string, parent: string) => {
    const folderList = await Folder.find({
      owner: userID,
      parentList: {
        $in: parent,
      },
      trashed: null,
    });

    return folderList;
  };
}

export default DbUtil;
