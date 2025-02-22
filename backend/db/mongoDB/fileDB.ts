import mongoose from "../connections/mongoose";
import { ObjectId } from "mongodb";
import File from "../../models/file-model";
import { UserInterface } from "../../models/user-model";
import { createFileQuery } from "../../utils/createQuery";
import { FileListQueryType } from "../../types/file-types";
import sortBySwitch from "../../utils/sortBySwitch";

class DbUtil {
  constructor() {}

  // READ

  getPublicFile = async (fileID: string) => {
    const file = await File.findOne({ _id: new ObjectId(fileID) });
    return file;
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.link": tempToken,
    });
    return file;
  };

  getFileInfo = async (fileID: string, userID: string) => {
    const file = await File.findOne({
      "metadata.owner": userID,
      _id: new ObjectId(fileID),
    });

    return file;
  };

  getQuickList = async (userID: string, limit: number) => {
    let query: any = {
      "metadata.owner": userID,
      "metadata.trashed": null,
      "metadata.processingFile": null,
    };

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

    const queryObj = createFileQuery(queryData);

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
      "metadata.processingFile": null,
    };

    if (mediaMode) query = { ...query, "metadata.hasThumbnail": true };

    const fileList = await File.find(query).limit(10);

    return fileList;
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

  // UPDATE

  updateFileUploadedFile = async (
    fileID: string,
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
        $unset: { "metadata.processingFile": null },
      },
      { new: true }
    );

    return file;
  };

  updateFolderUploadedFile = async (
    fileID: string,
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
        $unset: { "metadata.processingFile": null },
      },
      { new: true }
    );

    return file;
  };

  setThumbnail = async (fileID: string, thumbnailID: string) => {
    const file = await File.findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.hasThumbnail": false },
      {
        $set: {
          "metadata.hasThumbnail": true,
          "metadata.thumbnailID": thumbnailID,
        },
      }
    );

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

    return file;
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
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.metadata.linkType = "public";
    file.metadata.link = token;

    await file.save();

    return file;
  };

  makeOneTimePublic = async (fileID: string, userID: string, token: string) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.metadata.linkType = "one";
    file.metadata.link = token;

    await file.save();

    return file;
  };

  trashFile = async (
    fileID: string,
    parent: string,
    parentList: string,
    userID: string
  ) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.metadata.trashed = true;
    file.metadata.parent = parent;
    file.metadata.parentList = parentList;

    await file.save();

    return file;
  };

  restoreFile = async (fileID: string, userID: string) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.metadata.trashed = null;

    await file.save();

    return file;
  };

  removeTempToken = async (user: UserInterface, tempToken: string) => {
    user.tempTokens = user.tempTokens.filter((filterToken) => {
      return filterToken.token !== tempToken;
    });

    return user;
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
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.filename = title;

    await file.save();

    return file;
  };

  moveFile = async (
    fileID: string | mongoose.Types.ObjectId,
    userID: string,
    parent: string,
    parentList: string
  ) => {
    const file = await File.findOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });

    if (!file) return null;

    file.metadata.parent = parent;
    file.metadata.parentList = parentList;

    await file.save();

    return file;
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

  // DELETE

  deleteFile = async (fileID: string, userID: string) => {
    const result = await File.deleteOne({
      _id: new ObjectId(fileID),
      "metadata.owner": userID,
    });
    return result;
  };
}

export default DbUtil;
module.exports = DbUtil;
