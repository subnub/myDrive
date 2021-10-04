import GoogleFileService from '../services/GoogleFileService';
import FileService from '../services/FileService';
import { UserInterface } from '../models/user';
import PersonalFileService from '../services/PersonalFileService';
import { FileInterface } from '../models/file';

const fileService = new FileService();
const googleFileService = new GoogleFileService();
const personalFileService = new PersonalFileService();

export const fileTypes = {
  googleDrive: 'GOOGLE-DRIVE',
  myDrive: 'MY-DRIVE',
  personalDrive: 'PERSONAL-DRIVE',
};

interface IQueryObjectKeys {
  [key: string]: boolean | undefined;
}

export interface ListOptionsAndFileTypes extends IQueryObjectKeys {
  includeAllFileTypes?: boolean;
  myDriveIncluded?: boolean;
  googleDriveIncluded?: boolean;
  personalDriveIncludes?: boolean;
}

export const allFileTypesFromList = [
  (user: UserInterface, query: any, type?: string) =>
    fileService.getList(user, query, type),
  (user: UserInterface, query: any) => googleFileService.getList(user, query),
  // (user: UserInterface, query: any) => personalFileService.getList(user, query),
];

export const allQuickFileTypesFromList = [
  (user: UserInterface, query: any) => fileService.getQuickList(user),
  (user: UserInterface, query: any) =>
    googleFileService.getGoogleQuickList(user),
];
// export const allFileTypes  = {}

export type sortByType =
  | 'alp_desc'
  | 'alp_asc'
  | 'date_desc'
  | 'date_asc'
  | 'default';

export type fileListQueryType = {
  userID: string;
  parent: string;
  sortBy?: sortByType;
  startAt?: number;
  startAtDate?: string;
  searchQuery?: string | RegExp;
  startAtName?: string;
  folderSearch?: boolean;
  fileType?: keyof typeof fileTypes;
  filterByItemType?: string;
  trash?: boolean;
  pageToken?: string;
  pageTokenDocument?: FileInterface | undefined;
};
