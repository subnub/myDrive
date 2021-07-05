import { query, Request, response, Response } from 'express';
import FileService from '../services/FileService';
import MongoService from '../services/ChunkService/MongoService';
import FileSystemService from '../services/ChunkService/FileSystemService';
import S3Service from '../services/ChunkService/S3Service';
import User, { UserInterface } from '../models/user';
import sendShareEmail from '../utils/sendShareEmail';
import {
  createStreamVideoCookie,
  removeStreamVideoCookie,
} from '../cookies/createCookies';
import GoogleFileService from '../services/GoogleFileService';
import { googleQueryType } from '../utils/createQueryGoogle';
import convertDriveListToMongoList from '../utils/convertDriveListToMongoList';
import {
  allFileTypesFromList,
  fileTypes,
  ListOptionsAndFileTypes,
  allQuickFileTypesFromList,
} from '../types/fileTypes';
import PersonalFileController from './personalFile';
import PersonalFileService from '../services/PersonalFileService';

const fileService = new FileService();
const googleFileService = new GoogleFileService();
const personalFileService = new PersonalFileService();
const s3Service = new S3Service();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
  fileType?: keyof typeof fileTypes;
};

interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
  fileType?: keyof typeof fileTypes;
}

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

type ChunkServiceType = MongoService | FileSystemService | S3Service;

const getFileEndpointsByType = (types: ListOptionsAndFileTypes) => {
  if (!types || types.includeAllFileTypes) return allFileTypesFromList;
  const endpointFunctions = {
    myDriveIncluded: (user: UserInterface, query: any, type?: string) =>
      fileService.getList(user, query, type),
    googleDriveIncluded: (user: UserInterface, query: any) =>
      googleFileService.getList(user, query),
    // personalDriveIncludesnope: (
    //   user: UserInterface,
    //   query: any,
    //   type?: string,
    // ) => personalFileService.getList(user, query, type),
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

  if (types.personalDriveIncludes && !types.myDriveIncluded) {
    fileEndpointsList.push((user: UserInterface, query: any, type?: string) =>
      fileService.getList(user, query, type),
    );
  }

  console.log('current endpoints', fileEndpointsList);

  if (fileEndpointsList.length === 0) {
    return allFileTypesFromList;
  }

  return fileEndpointsList;
};

const getQuickFileEndpointsByType = (types: ListOptionsAndFileTypes) => {
  if (!types || types.includeAllFileTypes) return allQuickFileTypesFromList;
  const endpointFunctions = {
    myDriveIncluded: (user: UserInterface) => fileService.getQuickList(user),
    googleDriveIncluded: (user: UserInterface) =>
      googleFileService.getGoogleQuickList(user),
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

  if (fileEndpointsList.length === 0) {
    return allFileTypesFromList;
  }

  return fileEndpointsList;
};

// const getSingleFileEndpointByType = (types: ListOptionsAndFileTypes) => {
//   if (!types || types.includeAllFileTypes) return allFileTypesFromList;
//   const endpointFunctions = {
//     myDriveIncluded: (user: UserInterface, query: any) =>
//       fileService.getList(user, query),
//     googleDriveIncluded: (user: UserInterface, query: any) =>
//       googleFileService.getList(user, query),
//   } as any;
//   const fileEndpointsList = [];
//   const fileTypeKeys = Object.keys(types);

//   for (let i = 0; i < fileTypeKeys.length; i++) {
//     const currentKey = fileTypeKeys[i];
//     if (!currentKey) continue;
//     const currentItem = types[currentKey];
//     if (!currentItem || !endpointFunctions[currentKey]) continue;
//     console.log('current key', currentKey, endpointFunctions[currentKey]);
//     fileEndpointsList.push(endpointFunctions[currentKey]);
//   }

//   console.log('current endpoints', fileEndpointsList);

//   if (fileEndpointsList.length === 0) {
//     return allFileTypesFromList;
//   }

//   return fileEndpointsList;
// }

class FileController {
  chunkService: ChunkServiceType;

  constructor(chunkService: ChunkServiceType) {
    this.chunkService = chunkService;
  }

  getThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const id = req.params.id;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        return await googleFileService.getThumbnail(user, id, res);
      } else if (fileType === fileTypes.personalDrive) {
        const thumbnail = await s3Service.getThumbnail(user, id);
        return res.send(thumbnail);
      } else {
        const thumbnail = await this.chunkService.getThumbnail(user, id);
        return res.send(thumbnail);
      }

      const decryptedThumbnail = await this.chunkService.getThumbnail(user, id);

      res.send(decryptedThumbnail);
    } catch (e) {
      console.log('\nGet Thumbnail Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getFullThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const fileType = req.query.type;

      console.log('thumbnail get filetype', fileType);

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.getFullThumbnail(user, fileID, res);
      } else if (fileType === fileTypes.personalDrive) {
        await s3Service.getFullThumbnail(user, fileID, res);
      } else {
        await this.chunkService.getFullThumbnail(user, fileID, res);
      }
    } catch (e) {
      console.log('\nGet Thumbnail Full Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  uploadFile = async (req: RequestTypeFullUser, res: Response) => {
    console.log('upload request', !!req.user);

    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const busboy = req.busboy;
      const fileType = req.query.type;

      console.log('upload file type', fileType);

      if (fileType === fileTypes.myDrive) {
        req.pipe(busboy);
        const file = await this.chunkService.uploadFile(user, busboy, req);
        res.send(file);
      } else if (fileType === fileTypes.personalDrive) {
        req.pipe(busboy);
        const personalFile = await s3Service.uploadFile(
          user,
          busboy,
          req,
          fileType,
        );
        res.send(personalFile);
      } else {
        req.pipe(busboy);
        const file = await googleFileService.uploadFile(user, busboy, req, res);
        res.send(file);
      }
    } catch (e) {
      console.log('\nUploading File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.writeHead(code, { Connection: 'close' });
      res.end();
    }
  };

  getPublicDownload = async (req: RequestType, res: Response) => {
    try {
      const ID = req.params.id;
      const tempToken = req.params.tempToken;

      await this.chunkService.getPublicDownload(ID, tempToken, res);
    } catch (e) {
      console.log('\nGet Public Download Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  removeLink = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      await fileService.removeLink(userID, id);

      res.send();
    } catch (e) {
      console.log('\nRemove Public Link Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  makePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const token = await fileService.makePublic(userID, fileID);

      res.send(token);
    } catch (e) {
      console.log('\nMake Public Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getPublicInfo = async (req: RequestType, res: Response) => {
    try {
      const id = req.params.id;
      const tempToken = req.params.tempToken;

      const file = await fileService.getPublicInfo(id, tempToken);

      res.send(file);
    } catch (e) {
      console.log('\nGet Public Info Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  makeOneTimePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const token = await fileService.makeOneTimePublic(userID, id);

      res.send(token);
    } catch (e) {
      console.log('\nMake One Time Public Link Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getFileInfo = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const fileType = req.query.type;
      const user = req.user;
      const userID = user._id;

      console.log('info type', req.query);

      if (fileType === fileTypes.googleDrive) {
        const file = await googleFileService.getFileInfo(user, fileID);
        res.send(file);
      } else {
        const file = await fileService.getFileInfo(userID, fileID);
        res.send(file);
      }
    } catch (e) {
      console.log('\nGet File Info Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getQuickList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;

      // const quickList = await fileService.getQuickList(user);
      const fileListEndpoints = getQuickFileEndpointsByType(query as any);

      console.log('quick query', query);

      const arrays = await Promise.all(
        fileListEndpoints.map((currentfunction) => currentfunction(user)),
      );
      const combinedFiles = [];
      for (let i = 0; i < arrays.length; i++) {
        const currentArray = arrays[i];
        combinedFiles.push(...currentArray);
      }
      //console.log('list array', arrays);

      res.send(combinedFiles);

      // res.send(quickList);
    } catch (e) {
      console.log('\nGet Quick List Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getList = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;
      const { type, parent } = query;

      console.log('query-start', query);
      //const listOptionsAndFileTypes = req.headers.listOptionsAndFileTypes;

      if (parent !== '/') {
        if (!type) {
          const fileList = await fileService.getList(user, query);
          res.send(fileList);
        }

        if (type === fileTypes.googleDrive) {
          const fileList = await googleFileService.getList(user, query as any);
          res.send(fileList);
        } else if (
          type === fileTypes.personalDrive ||
          type === fileTypes.myDrive
        ) {
          const fileList = await fileService.getList(user, query, type);
          res.send(fileList);
        } else {
          console.log('UNSUPPORTED FILE TYPE');
        }
        return;
      }

      console.log('query', query);

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

      console.log('get mydrive filters', myDriveAndPersonalFilterType);

      //const myDriveAndPersonalFileFilter = (query as ListOptionsAndFileTypes).includeAllFileTypes ? undefined : (query as ListOptionsAndFileTypes).

      const fileListEndpoints = getFileEndpointsByType(query as any);

      console.log('file endpoints', fileListEndpoints);

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
      //console.log('list array', arrays);

      res.send(combinedFiles);
      // if (user.googleDriveEnabled) {
      //   const fileList = await fileService.getList(user, query);
      //   const googleFileList = await googleFileService.getList(
      //     user,
      //     query as any,
      //   );
      //   res.send([...fileList, ...googleFileList]);
      // } else {
      //   const fileList = await fileService.getList(user, query);
      //   res.send(fileList);
    } catch (e) {
      console.log('\nGet File List Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getDownloadToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;

      const tempToken = await fileService.getDownloadToken(user);

      res.send({ tempToken });
    } catch (e) {
      console.log('\nGet Download Token Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getAccessTokenStreamVideo = async (
    req: RequestTypeFullUser,
    res: Response,
  ) => {
    if (!req.user) return;

    try {
      const user = req.user;

      const currentUUID = req.headers.uuid as string;

      const streamVideoAccessToken = await user.generateAuthTokenStreamVideo(
        currentUUID,
      );

      createStreamVideoCookie(res, streamVideoAccessToken);

      res.send();
    } catch (e) {
      console.log(
        '\nGet Access Token Stream Video Fle Route Error:',
        e.message,
      );
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  removeStreamVideoAccessToken = async (
    req: RequestTypeFullUser,
    res: Response,
  ) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      const accessTokenStreamVideo = req.accessTokenStreamVideo!;

      await User.updateOne(
        { _id: userID },
        { $pull: { tempTokens: { token: accessTokenStreamVideo } } },
      );

      removeStreamVideoCookie(res);

      res.send();
    } catch (e) {
      console.log('Remove Video Token File Router Error:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  // No longer needed, left for reference

  // getDownloadTokenVideo = async(req: RequestTypeFullUser, res: Response) => {

  //     if (!req.user) {
  //         return
  //     }

  //     try {

  //         const user = req.user;
  //         const cookie = req.headers.uuid as string;

  //         const tempToken = await fileService.getDownloadTokenVideo(user, cookie);

  //         res.send({tempToken});

  //     } catch (e) {

  //         const code = e.code || 500;

  //         console.log(e);
  //         res.status(code).send()
  //     }
  // }

  removeTempToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const tempToken = req.params.tempToken;
      const currentUUID = req.params.uuid;

      await fileService.removeTempToken(user, tempToken, currentUUID);

      res.send();
    } catch (e) {
      console.log('\nRemove Temp Token Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  streamVideo = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const headers = req.headers;
      const fileType = req.query.type;
      const uuid = req.query.uuid as any;

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.streamVideo(user, fileID, uuid, req, res);
      } else if (fileType === fileTypes.personalDrive) {
        await s3Service.streamVideo(user, fileID, headers, res, req);
      } else {
        await this.chunkService.streamVideo(user, fileID, headers, res, req);
      }
    } catch (e) {
      console.log('\nStream Video Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  streamAudio = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const headers = req.headers;
      const fileType = req.query.type;
      const uuid = req.query.uuid as any;

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.streamVideo(user, fileID, uuid, req, res);
      } else if (fileType === fileTypes.personalDrive) {
        await s3Service.streamAudio(user, fileID, headers, res, req);
      } else {
        await this.chunkService.streamAudio(user, fileID, headers, res, req);
      }
    } catch (e) {
      console.log('\nStream Video Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  downloadFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const fileType = req.fileType;

      console.log('download file request', fileType);

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.downloadFile(user, fileID, res);
      } else if (fileType === fileTypes.personalDrive) {
        await s3Service.downloadFile(user, fileID, res);
      } else {
        await this.chunkService.downloadFile(user, fileID, res);
      }

      console.log('download finished');
    } catch (e) {
      console.log('\nDownload File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  getSuggestedList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      let searchQuery = req.query.search || '';

      const { fileList, folderList } = await fileService.getSuggestedList(
        userID,
        searchQuery,
      );

      return res.send({ folderList, fileList });
    } catch (e) {
      console.log('\nGet Suggested List Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  restoreFileFromTrash = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const { _id: userID } = req.user;
      // TODO ADD THIS FOR GOOGLE DRIVE TOO
      await fileService.restoreFileFromTrash(userID, fileID);

      res.send();
    } catch (e) {
      console.log('\nAdd To Trash File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  addToTrash = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const { _id: userID } = req.user;
      // TODO ADD THIS FOR GOOGLE DRIVE TOO
      await fileService.addFileToTrash(userID, fileID);

      res.send();
    } catch (e) {
      console.log('\nAdd To Trash File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  renameFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const title = req.body.title;
      const user = req.user;
      const userID = user._id;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.renameFile(user, fileID, title);
      } else {
        await fileService.renameFile(userID, fileID, title);
      }

      res.send();
    } catch (e) {
      console.log('\nRename File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  sendEmailShare = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user!;

      const fileID = req.body.file._id;
      const respient = req.body.file.resp;

      const file = await fileService.getFileInfo(user._id, fileID);

      await sendShareEmail(file, respient);

      res.send();
    } catch (e) {
      console.log('\nSend Share Email Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  moveFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const userID = req.user._id;
      const parentID = req.body.parent;

      await fileService.moveFile(userID, fileID, parentID);

      res.send();
    } catch (e) {
      console.log('\nMove File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };

  deleteFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const userID = user._id;
      const fileID = req.body.id;
      const fileType = req.query.type;

      if (fileType === fileTypes.googleDrive) {
        await googleFileService.removeFile(user, fileID);
      } else if (fileType === fileTypes.personalDrive) {
        await s3Service.deleteFile(userID, fileID);
      } else {
        await this.chunkService.deleteFile(userID, fileID);
      }

      res.send();
    } catch (e) {
      console.log('\nDelete File Error File Route:', e.message);
      const code = !e.code
        ? 500
        : e.code >= 400 && e.code <= 599
        ? e.code
        : 500;
      res.status(code).send();
    }
  };
}

export default FileController;
