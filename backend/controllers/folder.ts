import FolderService from '../services/FolderService';
import { Request, Response } from 'express';
import MongoService from '../services/ChunkService/MongoService';
import FileSystemService from '../services/ChunkService/FileSystemService';
import S3Service from '../services/ChunkService/S3Service';
import {
  allFileTypesFromList,
  fileTypes,
  ListOptionsAndFileTypes,
} from '../types/fileTypes';
import { UserInterface } from '../models/user';
import GoogleFolderService from '../services/GoogleFolderService';
import { allFolderTypesFromList } from '../types/folderTypes';
import PersonalFolderService from '../services/PersonalFolderService';

const folderService = new FolderService();
const googleFolderService = new GoogleFolderService();
const personalFolderService = new PersonalFolderService();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
  fileType?: keyof typeof fileTypes;
};

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
  fileType?: keyof typeof fileTypes;
}

type ChunkServiceType = MongoService | FileSystemService | S3Service;

const getFileEndpointsByType = (types: ListOptionsAndFileTypes) => {
  if (!types || types.includeAllFileTypes) return allFolderTypesFromList;
  const endpointFunctions = {
    myDriveIncluded: (user: UserInterface, query: any, type?: string) =>
      folderService.getFolderList(user, query, type),
    googleDriveIncluded: (user: UserInterface, query: any) =>
      googleFolderService.getList(user, query),
    // personalDriveIncludes: (user: UserInterface, query: any) =>
    //   personalFolderService.getFolderList(user, query),
  } as any;
  const fileEndpointsList = [];
  const fileTypeKeys = Object.keys(types);

  for (let i = 0; i < fileTypeKeys.length; i++) {
    const currentKey = fileTypeKeys[i];
    if (!currentKey) continue;
    const currentItem = types[currentKey];
    if (!currentItem || !endpointFunctions[currentKey]) continue;
    console.log('current key', currentKey, endpointFunctions[currentKey]);
    fileEndpointsList.push(endpointFunctions[currentKey]);
  }

  console.log('current endpoints', fileEndpointsList);

  if (types.personalDriveIncludes && !types.myDriveIncluded) {
    fileEndpointsList.push((user: UserInterface, query: any, type?: string) =>
      folderService.getFolderList(user, query, type),
    );
  }

  if (fileEndpointsList.length === 0) {
    return allFolderTypesFromList;
  }

  return fileEndpointsList;
};

class FolderController {
  chunkService: ChunkServiceType;

  constructor(chunkService: ChunkServiceType) {
    this.chunkService = chunkService;
  }

  uploadFolder = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const data = { ...req.body, trash: false, trashedTime: 0 };
      const { name, parent } = data;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        const folder = await googleFolderService.upload(user, name, parent);
        res.send(folder);
      } else {
        const folder = await folderService.uploadFolder(data);
        res.send(folder);
      }
    } catch (e) {
      console.log('\nUpload Folder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  restoreFolderFromTrash = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const folderID = req.body.id;
      const { _id: userID } = req.user;
      // TODO ADD THIS FOR GOOGLE DRIVE TOO
      await folderService.restoreFolderFromTrash(userID, folderID);

      res.send();
    } catch (e) {
      console.log('\nAdd To Trash File Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  addFolderToTrash = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const folderID = req.body.id;
      const { _id: userID } = req.user;
      // TODO ADD THIS FOR GOOGLE DRIVE TOO
      await folderService.addFolderToTrash(userID, folderID);

      res.send();
    } catch (e) {
      console.log('\nAdd To Trash File Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  deleteFolder = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const userID = user._id;
      const folderID = req.body.id;
      const parentList = req.body.parentList;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        await googleFolderService.removeFolder(user, folderID);
      } else {
        await this.chunkService.deleteFolder(userID, folderID, parentList);
      }

      res.send();
    } catch (e) {
      console.log('\nDelete Folder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getSubfolderFullList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const id: any = req.query.id;

      const subfolderList = await folderService.getSubfolderFullList(user, id);

      res.send(subfolderList);
    } catch (e) {
      console.log('\nGet Subfolder List Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  deletePersonalFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const parentList = req.body.parentList;

      const s3Service = new S3Service();

      await s3Service.deleteFolder(userID, folderID, parentList);

      res.send();
    } catch (e) {
      console.log('\nDelete Personal Folder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  deleteAll = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await this.chunkService.deleteAll(userID);

      res.send();
    } catch (e) {
      console.log('\nDelete All Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getInfo = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const userID = user._id;
      const folderID = req.params.id;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        const folder = await googleFolderService.getInfo(user, folderID);
        res.send(folder);
      } else {
        const folder = await folderService.getFolderInfo(userID, folderID);
        res.send(folder);
      }
    } catch (e) {
      console.log('\nGet Info Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getSubfolderList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.query.id as string;

      const { folderIDList, folderNameList } =
        await folderService.getFolderSublist(userID, folderID);

      res.send({ folderIDList, folderNameList });
    } catch (e) {
      console.log('\nGet Subfolder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getFolderList = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;
      const { type, parent } = query;

      if (parent !== '/') {
        if (!type) {
          const folderList = await folderService.getFolderList(user, query);
          res.send(folderList);
        }

        if (type === fileTypes.googleDrive) {
          const folderList = await googleFolderService.getList(
            user,
            query as any,
          );
          res.send(folderList);
        } else if (
          type === fileTypes.personalDrive ||
          type === fileTypes.myDrive
        ) {
          const folderList = await folderService.getFolderList(user, query);
          res.send(folderList);
        } else {
          console.log('UNSUPPORTED FILE TYPE FOLDER', type);
        }
        return;
      }

      const getMyDriveAndPersonalFileFilter = (
        query: ListOptionsAndFileTypes,
      ) => {
        console.log('get mydrive filters', query);
        let filter = '';
        if (query.includeAllFileTypes) return filter;

        if (query.myDriveIncluded && query.personalDriveIncludes) return filter;

        if (query.myDriveIncluded) return fileTypes.myDrive;
        if (query.personalDriveIncludes) return fileTypes.personalDrive;
        return filter;
      };

      const myDriveAndPersonalFilterType = getMyDriveAndPersonalFileFilter(
        query as ListOptionsAndFileTypes,
      );
      // const folderList = await folderService.getFolderList(user, query);
      const fileListEndpoints = getFileEndpointsByType(query as any);

      const arrays = await Promise.all(
        fileListEndpoints.map((currentfunction) =>
          currentfunction(user, query, myDriveAndPersonalFilterType),
        ),
      );
      const combinedFiles = [];
      for (let i = 0; i < arrays.length; i++) {
        const currentArray = arrays[i];
        combinedFiles.push(...currentArray);
      }
      //console.log('list array', combinedFiles);

      res.send(combinedFiles);

      //res.send(folderList);
    } catch (e) {
      console.log('\nGet Folder List Error Folder Route:', e);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  moveFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const parent = req.body.parent;

      await folderService.moveFolder(userID, folderID, parent);

      res.send();
    } catch (e) {
      console.log('\nMove Folder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  renameFolder = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const userID = user._id;
      const folderID = req.body.id;
      const title = req.body.title;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        await googleFolderService.renameFolder(user, folderID, title);
      } else {
        await folderService.renameFolder(userID, folderID, title);
      }

      res.send();
    } catch (e) {
      console.log('\nRename Folder Error Folder Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };
}

export default FolderController;
