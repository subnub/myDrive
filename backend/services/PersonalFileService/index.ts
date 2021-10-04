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

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

class PersonalFileService {
  constructor() {}

  //TODO: This might not be needed, try to remove as much of these as possible
  getList = async (
    user: userAccessType | UserInterface,
    query: any,
    type?: string,
  ) => {
    const userID = user._id;

    let searchQuery = query.search || '';
    const parent = query.parent || '/';
    let limit = query.limit || 50;
    let sortBy = query.sortby || 'DEFAULT';
    const startAt = query.startAt || undefined;
    const startAtDate = query.startAtDate || '0';
    const startAtName = query.startAtName || '';
    const storageType = query.storageType || undefined;
    const folderSearch = query.folder_search || undefined;
    sortBy = sortBySwitch(sortBy);
    limit = parseInt(limit);

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
    });

    const fileList = await dbUtilsFile.getList(queryObj, sortBy, limit);

    console.log('personal file list length', fileList.length);

    if (!fileList) throw new NotFoundError('File List Not Found');

    return fileList;
  };
}

export default PersonalFileService;
