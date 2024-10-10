import mongoose from "../connections/mongoose";
import { ObjectId } from "mongodb";
import File from "../../models/file-model";
import { UserInterface } from "../../models/user-model";
import createQuery, { QueryInterface } from "../../utils/createQuery";
import { FileListQueryType } from "../../types/file-types";
import sortBySwitch from "../../utils/sortBySwitch";

class DbUtil {
  constructor() {}

  getPublicFile = async (fileID: string) => {
    const file = await File.findOne({ _id: new ObjectId(fileID) });
    return file;
  };

  removeOneTimePublicLink = async (
    fileID: string | mongoose.Types.ObjectId
  ) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID) },
      {
        $unset: { "metadata.linkType": "", "metadata.link": "" },
      }
    );
  };

  removeLink = async (fileID: string, userID: string) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      { $unset: { "metadata.linkType": "", "metadata.link": "" } },
      { new: true }
    );

    return file;
  };

  makePublic = async (fileID: string, userID: string, token: string) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      { $set: { "metadata.linkType": "public", "metadata.link": token } },
      { new: true }
    );

    return file;
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.link": tempToken,
    });
    return file;
  };

  makeOneTimePublic = async (fileID: string, userID: string, token: string) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      { $set: { "metadata.linkType": "one", "metadata.link": token } },
      { new: true }
    );

    return file;
  };

  trashFile = async (
    fileID: string,
    parent: string,
    parentList: string,
    userID: string
  ) => {
    const result = await File.findByIdAndUpdate(
      {
        _id: new ObjectId(fileID),
        "metadata.owner": userID,
      },
      {
        $set: {
          "metadata.trashed": true,
          "metadata.parent": parent,
          "metadata.parentList": parentList,
        },
      }
    );
    return result;
  };

  restoreFile = async (fileID: string, userID: string) => {
    const result = await File.updateOne(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      {
        $set: {
          "metadata.trashed": null,
        },
      }
    );
    return result;
  };

  getFileInfo = async (fileID: string, userID: string) => {
    const file = await File.findOne({
      "metadata.owner": userID,
      _id: new ObjectId(fileID),
    });

    return file;
  };

  getQuickList = async (userID: string, limit: number) => {
    let query: any = { "metadata.owner": userID, "metadata.trashed": null };

    const fileList = await File.find(query)
      .sort({ uploadDate: -1 })
      .limit(limit);

    return fileList;
  };

  getList = async (
    queryData: FileListQueryType,
    sortBy: string,
    limit: number
  ) => {
    const formattedSortBy = sortBySwitch(sortBy);

    const queryObj = createQuery(queryData);

    if (sortBy.includes("alp_")) {
      const fileList = await File.find(queryObj)
        .collation({ locale: "en", strength: 2 })
        .sort(formattedSortBy)
        .limit(limit);

      return fileList;
    } else {
      const fileList = await File.find(queryObj)
        .sort(formattedSortBy)
        .limit(limit);

      return fileList;
    }
  };

  removeTempToken = async (user: UserInterface, tempToken: string) => {
    user.tempTokens = user.tempTokens.filter((filterToken) => {
      return filterToken.token !== tempToken;
    });

    return user;
  };

  getFileSearchList = async (
    userID: string,
    searchQuery: RegExp,
    trashMode: boolean,
    mediaMode: boolean
  ) => {
    let query: any = {
      "metadata.owner": userID,
      filename: searchQuery,
      "metadata.trashed": trashMode ? true : null,
    };

    if (mediaMode) query = { ...query, "metadata.hasThumbnail": true };

    const fileList = await File.find(query).limit(10);

    return fileList;
  };

  trashFilesByParent = async (parentList: string, userID: string) => {
    const result = await File.updateMany(
      {
        "metadata.owner": userID,
        "metadata.parentList": { $regex: `.*${parentList}.*` }, // REGEX
      },
      {
        $set: {
          "metadata.trashed": true,
        },
      }
    );
    return result;
  };

  restoreFilesByParent = async (parentList: string, userID: string) => {
    const result = await File.updateMany(
      {
        "metadata.owner": userID,
        "metadata.parentList": { $regex: `.*${parentList}.*` }, // REGEX
      },
      {
        $set: {
          "metadata.trashed": null,
        },
      }
    );
    return result;
  };

  renameFile = async (fileID: string, userID: string, title: string) => {
    const updateFileResponse = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      { $set: { filename: title } }
    );
    return updateFileResponse;
  };

  moveFile = async (
    fileID: string | mongoose.Types.ObjectId,
    userID: string,
    parent: string,
    parentList: string
  ) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      {
        $set: {
          "metadata.parent": parent,
          "metadata.parentList": parentList,
        },
      },
      { new: true }
    );

    return file;
  };

  getFileListByIncludedParent = async (
    userID: string | mongoose.Types.ObjectId,
    parentListString: string
  ) => {
    const fileList = await File.find({
      "metadata.owner": userID,
      "metadata.parentList": { $regex: `.*${parentListString}.*` },
    });

    return fileList;
  };

  getFileListByOwner = async (userID: string) => {
    const fileList = await File.find({ "metadata.owner": userID });

    return fileList;
  };

  getFileListByParent = async (userID: string, parent: string) => {
    const fileList = await File.find({
      owner: userID,
      "metadata.parent": parent,
    });

    return fileList;
  };

  moveMultipleFiles = async (
    userID: string | mongoose.Types.ObjectId,
    currentParent: string,
    newParent: string,
    newParentList: string
  ) => {
    await File.updateMany(
      { "metadata.owner": userID, "metadata.parent": currentParent },
      {
        $set: {
          "metadata.parent": newParent,
          "metadata.parentList": newParentList,
        },
      },
      { new: true }
    );
  };
}

export default DbUtil;
module.exports = DbUtil;
