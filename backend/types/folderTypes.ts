import { UserInterface } from '../models/user';
import FolderService from '../services/FolderService';
import GoogleFolderService from '../services/GoogleFolderService';

const folderService = new FolderService();
const googleFolderService = new GoogleFolderService();

export const allFolderTypesFromList = [
  (user: UserInterface, query: any) => folderService.getFolderList(user, query),
  (user: UserInterface, query: any) => googleFolderService.getList(user, query),
];
