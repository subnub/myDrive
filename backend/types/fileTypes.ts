import GoogleFileService from '../services/GoogleFileService';
import FileService from '../services/FileService';
import { UserInterface } from '../models/user';

const fileService = new FileService();
const googleFileService = new GoogleFileService();

export const fileTypes = {
  googleDrive: 'GOOGLE-DRIVE',
  myDrive: 'MY-DRIVE',
};

interface IQueryObjectKeys {
  [key: string]: boolean | undefined;
}

export interface ListOptionsAndFileTypes extends IQueryObjectKeys {
  includeAllFileTypes?: boolean;
  myDriveIncluded?: boolean;
  googleDriveIncluded?: boolean;
}

export const allFileTypesFromList = [
  (user: UserInterface, query: any) => fileService.getList(user, query),
  (user: UserInterface, query: any) => googleFileService.getList(user, query),
];

export const allQuickFileTypesFromList = [
  (user: UserInterface, query: any) => fileService.getQuickList(user),
  (user: UserInterface, query: any) =>
    googleFileService.getGoogleQuickList(user),
];
// export const allFileTypes  = {}
