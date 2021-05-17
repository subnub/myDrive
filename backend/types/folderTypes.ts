import { UserInterface } from '../models/user';
import FolderService from '../services/FolderService';
import GoogleFolderService from '../services/GoogleFolderService';
import PersonalFolderService from '../services/PersonalFolderService';

const folderService = new FolderService();
const googleFolderService = new GoogleFolderService();
const personalFolderService = new PersonalFolderService();

export const allFolderTypesFromList = [
  (user: UserInterface, query: any, type?: string) =>
    folderService.getFolderList(user, query, type),
  // (user: UserInterface, query: any) =>
  //   personalFolderService.getFolderList(user, query),
  (user: UserInterface, query: any) => googleFolderService.getList(user, query),
];
