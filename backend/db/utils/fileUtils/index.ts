import mongoose from "../../mongoose";
import { ObjectId } from "mongodb";
import File, { FileInterface } from "../../../models/file";
import { UserInterface } from "../../../models/user";
import { QueryInterface } from "../../../utils/createQuery";
const conn = mongoose.connection;

class DbUtil {
  constructor() {}

  getPublicFile = async (fileID: string) => {
    let file = (await conn.db
      .collection("fs.files")
      .findOne({ _id: new ObjectId(fileID) })) as FileInterface;

    return file;
  };

  removeOneTimePublicLink = async (
    fileID: string | mongoose.Types.ObjectId
  ) => {
    mongoose;
    const file = (await conn.db.collection("fs.files").findOneAndUpdate(
      { _id: new ObjectId(fileID) },
      {
        $unset: { "metadata.linkType": "", "metadata.link": "" },
      }
    )) as FileInterface;

    return file;
  };

  removeLink = async (fileID: string, userID: string) => {
    const file = (await conn.db
      .collection("fs.files")
      .findOneAndUpdate(
        { _id: new ObjectId(fileID), "metadata.owner": userID },
        { $unset: { "metadata.linkType": "", "metadata.link": "" } }
      )) as FileInterface;

    return file;
  };

  makePublic = async (fileID: string, userID: string, token: string) => {
    const file = (await conn.db
      .collection("fs.files")
      .findOneAndUpdate(
        { _id: new ObjectId(fileID), "metadata.owner": userID },
        { $set: { "metadata.linkType": "public", "metadata.link": token } }
      )) as FileInterface;

    return file;
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file = (await conn.db.collection("fs.files").findOne({
      _id: new ObjectId(fileID),
      "metadata.link": tempToken,
    })) as FileInterface;

    return file;
  };

  makeOneTimePublic = async (fileID: string, userID: string, token: string) => {
    const file = (await conn.db
      .collection("fs.files")
      .findOneAndUpdate(
        { _id: new ObjectId(fileID), "metadata.owner": userID },
        { $set: { "metadata.linkType": "one", "metadata.link": token } }
      )) as FileInterface;

    return file;
  };

  trashFile = async (fileID: string, userID: string) => {
    const result = await File.findByIdAndUpdate(
      {
        _id: new ObjectId(fileID),
        "metadata.owner": userID,
      },
      {
        $set: {
          "metadata.trashed": true,
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
    //TODO: Using mongoose like this causes the object to be returned in raw form
    // const file = await File.findOne({
    //   "metadata.owner": userID,
    //   _id: new ObjectId(fileID),
    // });
    const file = await conn.db.collection("fs.files").findOne({
      "metadata.owner": userID,
      _id: new ObjectId(fileID),
    });

    return file;
  };

  getQuickList = async (userID: string, limit: number) => {
    let query: any = { "metadata.owner": userID, "metadata.trashed": null };

    const fileList = (await conn.db
      .collection("fs.files")
      .find(query)
      .sort({ uploadDate: -1 })
      .limit(limit)
      .toArray()) as FileInterface[];

    return fileList;
  };

  getList = async (queryObj: QueryInterface, sortBy: string, limit: number) => {
    const fileList = (await conn.db
      .collection("fs.files")
      .find(queryObj)
      .sort(sortBy)
      .limit(limit)
      .toArray()) as FileInterface[];

    return fileList;
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
    trashMode: boolean
  ) => {
    let query: any = {
      "metadata.owner": userID,
      filename: searchQuery,
      "metadata.trashed": trashMode ? true : null,
    };

    const fileList = (await conn.db
      .collection("fs.files")
      .find(query)
      .limit(10)
      .toArray()) as FileInterface[];

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
    const file = await conn.db.collection("fs.files").findOneAndUpdate(
      { _id: new ObjectId(fileID), "metadata.owner": userID },
      {
        $set: {
          "metadata.parent": parent,
          "metadata.parentList": parentList,
        },
      }
    );

    return file;
  };

  getFileListByParent = async (
    userID: string | mongoose.Types.ObjectId,
    parentListString: string
  ) => {
    const fileList = (await conn.db
      .collection("fs.files")
      .find({
        "metadata.owner": userID,
        "metadata.parentList": { $regex: `.*${parentListString}.*` },
      })
      .toArray()) as FileInterface[];

    return fileList;
  };

  getFileListByOwner = async (userID: string) => {
    const fileList = (await conn.db
      .collection("fs.files")
      .find({ "metadata.owner": userID })
      .toArray()) as FileInterface[];

    return fileList;
  };

  removeChunksByID = async (fileID: string) => {
    await conn.db.collection("fs.chunks").deleteMany({ files_id: fileID });
  };
}

export default DbUtil;
module.exports = DbUtil;
