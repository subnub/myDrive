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
import InternalServerError from '../../utils/InternalServerError';
import UtilsFile from '../../db/utils/fileUtils';
import UtilsFolder from '../../db/utils/folderUtils';

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

const utilsFile = new UtilsFile();
const utilsFolder = new UtilsFolder();

class PersonalFolderService {
  constructor() {}

  getFolderList = async (user: UserInterface, query: any, type?: string) => {
    const userID = user._id;

    let searchQuery = query.search || '';
    const parent = query.parent || '/';
    let sortBy = query.sortby || 'DEFAULT';
    // const type = query.type;
    const storageType = query.storageType || undefined;
    const folderSearch = query.folder_search || undefined;
    const itemType = fileTypes.personalDrive;
    sortBy = sortBySwitch(sortBy);

    const s3Enabled = user.s3Enabled ? true : false;

    const folderList = await utilsFolder.getFolderListByParent(
      userID,
      parent,
      sortBy,
      s3Enabled,
      undefined as any,
      storageType,
      searchQuery,
      type as keyof typeof fileTypes,
    );

    if (!folderList) throw new NotFoundError('Folder List Not Found Error');

    return folderList;

    // if (searchQuery.length === 0) {
    //   const folderList = await utilsFolder.getFolderListByParent(
    //     userID,
    //     parent,
    //     sortBy,
    //     s3Enabled,
    //     undefined as any,
    //     storageType,
    //     searchQuery,
    //     type as keyof typeof fileTypes,
    //   );

    //   if (!folderList) throw new NotFoundError('Folder List Not Found Error');

    //   return folderList;
    // } else {
    //   searchQuery = new RegExp(searchQuery, 'i');
    //   const folderList = await utilsFolder.getFolderListBySearch(
    //     userID,
    //     searchQuery,
    //     sortBy,
    //     undefined as any,
    //     parent,
    //     storageType,
    //     folderSearch,
    //     itemType,
    //     s3Enabled,

    if (!folderList) throw new NotFoundError('Folder List Not Found Error');

    return folderList;
  };
}

export default PersonalFolderService;
