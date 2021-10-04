import NotAuthorizedError from '../../utils/NotAuthorizedError';
import NotFoundError from '../../utils/NotFoundError';
import env from '../../enviroment/env';
import jwt from 'jsonwebtoken';
import Folder from '../../models/folder';
import sortBySwitch from '../../utils/sortBySwitch';
import createQuery from '../../utils/createQuery';
import DbUtilFile from '../../db/utils/fileUtils/index';
import DbUtilFolder from '../../db/utils/folderUtils';
import { UserInterface } from '../../models/user';
import { FileInterface } from '../../models/file';
import tempStorage from '../../tempStorage/tempStorage';
import { fileTypes } from '../../types/fileTypes';
import { ObjectID } from 'mongodb';

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

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

    if (currentFile.metadata.linkType === 'one') {
      await dbUtilsFile.removeOneTimePublicLink(fileID);
    }
  };

  removeLink = async (userID: string, fileID: string) => {
    const file = await dbUtilsFile.removeLink(fileID, userID);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Remove Link File Not Found Error');
  };

  makePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await dbUtilsFile.makePublic(fileID, userID, token);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Make Public File Not Found Error');

    return token;
  };

  getPublicInfo = async (fileID: string, tempToken: string) => {
    const file: FileInterface = await dbUtilsFile.getPublicInfo(
      fileID,
      tempToken,
    );

    if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
      throw new NotFoundError('Public Info Not Found');
    } else {
      return file;
    }
  };

  makeOneTimePublic = async (userID: string, fileID: string) => {
    const token = jwt.sign({ _id: userID.toString() }, env.passwordAccess!);

    const file = await dbUtilsFile.makeOneTimePublic(fileID, userID, token);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Make One Time Public Not Found Error');

    return token;
  };

  getFileInfo = async (userID: string, fileID: string) => {
    let currentFile = await dbUtilsFile.getFileInfo(fileID, userID);

    if (!currentFile) throw new NotFoundError('Get File Info Not Found Error');

    const parentID = currentFile.metadata.parent;

    let parentName = '';

    if (parentID === '/') {
      parentName = 'Home';
    } else {
      const parentFolder = await Folder.findOne({
        owner: userID,
        _id: parentID,
      });

      if (parentFolder) {
        parentName = parentFolder.name;
      } else {
        parentName = 'Unknown';
      }
    }

    return { ...currentFile, parentName };
  };

  getQuickList = async (user: userAccessType | UserInterface) => {
    console.log('getting quick list mongo');
    const userID = user._id;
    const s3Enabled = user.s3Enabled ? true : false;

    const quickList = await dbUtilsFile.getQuickList(userID, s3Enabled);

    if (!quickList) throw new NotFoundError('Quick List Not Found Error');

    console.log('got quick list mongo');

    return quickList;
  };

  getList = async (
    user: userAccessType | UserInterface,
    query: any,
    type?: string,
  ) => {
    const userID = user._id;

    let searchQuery = query.search || '';
    const parent = query.parent || '/';
    let limit = query.limit || 50;
    const sortBy = query.sortBy || 'default';
    // let sortBy = query.sortBy || 'DEFAULT';
    const startAt = query.startAt || undefined;
    const startAtDate = query.startAtDate || '0';
    const startAtName = query.startAtName || '';
    const storageType = query.storageType || undefined;
    const folderSearch = query.folder_search || undefined;
    const filterByItemType = query.filterByItemType || undefined;
    const sortByObject = sortBySwitch(sortBy);
    const trash = query.trash || undefined;
    const pageToken = query.pageToken || undefined;
    limit = parseInt(limit);

    const pageTokenDocument = pageToken
      ? await dbUtilsFile.getFileInfo(pageToken, userID)
      : undefined;

    console.log('TYPE', type);
    console.log('SORT BY', sortBy);
    console.log('query sort', sortByObject);
    console.log('trash', trash);

    const s3Enabled = user.s3Enabled ? true : false;

    const queryObj = createQuery({
      userID,
      parent,
      sortBy,
      startAt,
      startAtDate,
      searchQuery,
      startAtName,
      folderSearch,
      filterByItemType,
      trash,
      pageToken,
      pageTokenDocument,
    });

    const fileList = await dbUtilsFile.getList(queryObj, sortByObject, limit);
    // console.log('file list first item', fileList[0]);
    // console.log('file list last item', fileList[fileList.length - 1]);

    for (const file of fileList) {
      console.log('searching', file._id);
      if (file._id.toString() === '60e66847715cd2f8b6a160f9') {
        console.log('F9-FILEID-FOUND');
      }
    }

    //console.log('file list', fileList);

    console.log('query-test', queryObj);

    if (!fileList) throw new NotFoundError('File List Not Found');

    return fileList;
  };

  getDownloadToken = async (user: UserInterface) => {
    const tempToken = await user.generateTempAuthToken();

    if (!tempToken)
      throw new NotAuthorizedError('Get Download Token Not Authorized Error');

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
    currentUUID: string,
  ) => {
    const key = user.getEncryptionKey();

    const decoded = (await jwt.verify(tempToken, env.passwordAccess!)) as any;

    const publicKey = decoded.iv;

    const encryptedToken = user.encryptToken(tempToken, key, publicKey);

    const removedTokenUser = await dbUtilsFile.removeTempToken(
      user,
      encryptedToken,
    );

    if (!removedTokenUser)
      throw new NotFoundError('Remove Temp Token User Not Found Errors');

    delete tempStorage[currentUUID];

    await removedTokenUser.save();
  };

  getSuggestedList = async (userID: string, searchQuery: any) => {
    searchQuery = new RegExp(searchQuery, 'i');

    const fileList = await dbUtilsFile.getFileSearchList(userID, searchQuery);
    const folderList = await dbUtilsFolder.getFolderSearchList(
      userID,
      searchQuery,
    );

    if (!fileList || !folderList)
      throw new NotFoundError('Suggested List Not Found Error');

    return {
      fileList,
      folderList,
    };
  };

  restoreFileFromTrash = async (userID: string, fileID: string) => {
    const file = await dbUtilsFile.restoreFileFromTrash(fileID, userID);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Add File To Trash File Not Found Error');

    return file;
  };

  addFileToTrash = async (userID: string, fileID: string) => {
    const date = new Date();
    const trashedTime = date.getTime();

    const file = await dbUtilsFile.addFileToTrash(fileID, trashedTime, userID);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Add File To Trash File Not Found Error');

    return file;
  };

  renameFile = async (userID: string, fileID: string, title: string) => {
    const file = await dbUtilsFile.renameFile(fileID, userID, title);

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Rename File Not Found Error');

    return file;
  };

  moveFile = async (userID: string, fileID: string, parentID: string) => {
    let parentList = ['/'];

    if (parentID.length !== 1) {
      const parentFile = await dbUtilsFolder.getFolderInfo(parentID, userID);
      if (!parentFile)
        throw new NotFoundError('Rename Parent File Not Found Error');
      const parentList = parentFile.parentList;
      parentList.push(parentID);
    }

    const file = await dbUtilsFile.moveFile(
      fileID,
      userID,
      parentID,
      parentList.toString(),
    );

    if (!file.lastErrorObject.updatedExisting)
      throw new NotFoundError('Rename File Not Found Error');

    return file;
  };
}

export default MongoFileService;
