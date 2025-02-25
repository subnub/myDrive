import Folder, { FolderInterface } from "../../models/folder-model";
import { ObjectId } from "mongodb";
import { FolderListQueryType } from "../../types/folder-types";
import { createFolderQuery } from "../../utils/createQuery";
import sortBySwitch from "../../utils/sortBySwitchFolder";

class DbUtil {
  constructor() {}

  // READ

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

  getFolderList = async (queryData: FolderListQueryType, sortBy: string) => {
    const query = createFolderQuery(queryData);

    const sortByQuery = sortBySwitch(sortBy);

    const folderList = await Folder.find(query).sort(sortByQuery);

    return folderList;
  };

  getMoveFolderList = async (
    userID: string,
    parent = "/",
    search?: string,
    folderIDs?: string[]
  ) => {
    let query: any = {
      owner: userID,
    };

    // const idQuery = [];

    // if (currentParent && currentParent !== "/") {
    //   idQuery.push(currentParent);
    // }

    // if (folderID) {
    //   query.parentList = { $ne: folderID };
    //   idQuery.push(folderID);
    // }

    if (folderIDs && folderIDs.length > 0) {
      query._id = { $nin: folderIDs };
      query.parentList = { $nin: folderIDs };
    }

    // query._id = { $nin: idQuery };

    if (!search || search === "") {
      query.parent = parent;
    }

    if (search && search !== "") {
      query.name = new RegExp(search, "i");
    }

    query.trashed = null;

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

  findAllFoldersByParent = async (parentID: string, userID: string) => {
    const folderList = await Folder.find({
      parentList: parentID,
      owner: userID,
    });

    return folderList;
  };

  // UPDATE

  moveFolder = async (
    folderID: string,
    userID: string,
    parent: string,
    parentList: string[]
  ) => {
    const folder = await Folder.findOne({
      _id: new ObjectId(folderID),
      owner: userID,
    });

    if (!folder) return null;

    folder.parent = parent;
    folder.parentList = parentList;

    await folder.save();

    return folder;
  };

  renameFolder = async (folderID: string, userID: string, title: string) => {
    const folder = await Folder.findOne({
      _id: new ObjectId(folderID),
      owner: userID,
    });

    if (!folder) return null;

    folder.name = title;

    await folder.save();

    return folder;
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

  restoreFolder = async (folderID: string, userID: string) => {
    const folder = await Folder.findOne({
      _id: new ObjectId(folderID),
      owner: userID,
    });

    if (!folder) return null;

    folder.trashed = null;

    await folder.save();

    return folder;
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

  trashFolder = async (folderID: string, userID: string) => {
    const folder = await Folder.findOne({
      _id: new ObjectId(folderID),
      owner: userID,
    });

    if (!folder) return null;

    folder.trashed = true;

    await folder.save();

    return folder;
  };

  // CREATE

  createFolder = async (folderData: {
    name: string;
    parent: string;
    parentList: string[];
    owner: string;
  }) => {
    const folder = new Folder(folderData);

    await folder.save();

    return folder;
  };

  // DELETE

  deleteFolder = async (folderID: string, userID: string) => {
    const result = await Folder.deleteOne({
      _id: new ObjectId(folderID),
      owner: userID,
    });
    return result;
  };

  deleteFoldersByParentList = async (
    parentList: (string | ObjectId)[],
    userID: string
  ) => {
    const result = await Folder.deleteMany({
      owner: userID,
      parentList: { $all: parentList },
    });
    return result;
  };

  deleteFoldersByOwner = async (userID: string) => {
    const result = await Folder.deleteMany({ owner: userID });
    return result;
  };
}

export default DbUtil;
