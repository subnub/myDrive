import { NextFunction, Request, Response } from "express";
import FileService from "../services/file-service/file-service";
import User, { UserInterface } from "../models/user-model";
import {
  createStreamVideoCookie,
  removeStreamVideoCookie,
} from "../cookies/create-cookies";
import ChunkService from "../services/chunk-service/chunk-service";
import streamToBuffer from "../utils/streamToBuffer";
import NotAuthorizedError from "../utils/NotAuthorizedError";
import { FileListQueryType } from "../types/file-types";
import fs from "fs";

const fileService = new FileService();
type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

export interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
}

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

class FileController {
  chunkService;

  constructor() {
    this.chunkService = new ChunkService();
  }

  getThumbnail = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }
    try {
      const user = req.user;
      const id = req.params.id;

      await this.chunkService.getThumbnail(user, id, res);
    } catch (e: unknown) {
      next(e);
    }
  };

  getFullThumbnail = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }
    try {
      const user = req.user;
      const fileID = req.params.id;

      await this.chunkService.getFullThumbnail(user, fileID, res);
    } catch (e: unknown) {
      next(e);
    }
  };

  uploadFile = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const busboy = req.busboy;

      const file = await this.chunkService.uploadFile(user, busboy, req);

      res.send(file);
    } catch (e: unknown) {
      next(e);
    }
  };

  getPublicDownload = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const ID = req.params.id;
      const tempToken = req.params.tempToken;

      await this.chunkService.getPublicDownload(ID, tempToken, res);
    } catch (e: unknown) {
      next(e);
    }
  };

  removeLink = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const file = await fileService.removeLink(userID, id);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  makePublic = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const { file, token } = await fileService.makePublic(userID, fileID);

      res.send({ file, token });
    } catch (e) {
      next(e);
    }
  };

  getPublicInfo = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const tempToken = req.params.tempToken;

      const file = await fileService.getPublicInfo(id, tempToken);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  makeOneTimePublic = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const { file, token } = await fileService.makeOneTimePublic(userID, id);

      res.send({ file, token });
    } catch (e) {
      next(e);
    }
  };

  getFileInfo = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const file = await fileService.getFileInfo(userID, fileID);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  getQuickList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const limit = Number.parseInt(req.query.limit as string) || 20;

      const quickList = await fileService.getQuickList(user, limit);

      res.send(quickList);
    } catch (e) {
      next(e);
    }
  };

  getList = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const query = req.query;

      const search = (query.search as string) || undefined;
      const parent = (query.parent as string) || "/";
      const limit = Number.parseInt(query.limit as string) || 50;
      const sortBy = (query.sortBy as string) || "date_desc";
      const startAtDate = (query.startAtDate as string) || undefined;
      const startAtName = (query.startAtName as string) || undefined;
      const trashMode = query.trashMode === "true";
      const mediaMode = query.mediaMode === "true";
      const mediaFilter = (query.mediaFilter as string) || "all";

      const queryData: FileListQueryType = {
        userID,
        search,
        parent,
        startAtDate,
        startAtName,
        trashMode,
        mediaMode,
        sortBy,
        mediaFilter,
      };

      const fileList = await fileService.getList(queryData, sortBy, limit);

      res.send(fileList);
    } catch (e) {
      next(e);
    }
  };

  getDownloadToken = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;

      const tempToken = await fileService.getDownloadToken(user);

      res.send({ tempToken });
    } catch (e) {
      next(e);
    }
  };

  getAccessTokenStreamVideo = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) return;

    try {
      const user = req.user;

      const currentUUID = req.headers.uuid as string;

      const streamVideoAccessToken = await user.generateAuthTokenStreamVideo(
        currentUUID
      );

      createStreamVideoCookie(res, streamVideoAccessToken);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  removeStreamVideoAccessToken = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      const accessTokenStreamVideo = req.accessTokenStreamVideo!;

      if (!accessTokenStreamVideo) {
        throw new NotAuthorizedError("No Access Token");
      }

      await User.updateOne(
        { _id: userID },
        { $pull: { tempTokens: { token: accessTokenStreamVideo } } }
      );

      removeStreamVideoCookie(res);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  removeTempToken = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
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
      next(e);
    }
  };

  streamVideo = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const headers = req.headers;

      await this.chunkService.streamVideo(user, fileID, headers, res);
    } catch (e: unknown) {
      next(e);
    }
  };

  streamVideoTest = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const headers = req.headers;
      console.log("headers", headers.range);
      const fileSize = 26867866;
      const range = headers.range!;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const readStream = fs.createReadStream(
        "/Users/kylehoell/Developer/myDrive-4/upgrade/old/video.mp4",
        { start, end }
      );

      const head = {
        "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);

      readStream.on("data", (data) => {
        res.write(data);
      });

      readStream.on("end", () => {
        res.end();
      });
    } catch (e: unknown) {
      next(e);
    }
  };

  downloadFile = async (
    req: RequestTypeFullUser,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;

      await this.chunkService.downloadFile(user, fileID, res);
    } catch (e: unknown) {
      next(e);
    }
  };

  getSuggestedList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const searchQuery = req.query.search as string;
      const trashMode = req.query.trashMode === "true";
      const mediaMode = req.query.mediaMode === "true";

      const { fileList, folderList } = await fileService.getSuggestedList(
        userID,
        searchQuery,
        trashMode,
        mediaMode
      );

      return res.send({ folderList, fileList });
    } catch (e) {
      next(e);
    }
  };

  renameFile = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const title = req.body.title;
      const userID = req.user._id;

      const file = await fileService.renameFile(userID, fileID, title);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  moveFile = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id as string;
      const userID = req.user._id as string;
      const parentID = (req.body.parentID as string) || "/";

      const file = await fileService.moveFile(userID, fileID, parentID);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  moveMultiFile = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;
      const parentID = (req.body.parentID as string) || "/";

      await fileService.moveMultiFiles(userID, items, parentID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  trashFile = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      const trashedFile = await fileService.trashFile(userID, fileID);

      res.send(trashedFile.toObject());
    } catch (e) {
      next(e);
    }
  };

  restoreFile = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      const file = await fileService.restoreFile(userID, fileID);

      res.send(file);
    } catch (e) {
      next(e);
    }
  };

  deleteFile = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      await this.chunkService.deleteFile(userID, fileID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  deleteMulti = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      await this.chunkService.deleteMulti(userID, items);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  trashMulti = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      await fileService.trashMulti(userID, items);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  restoreMulti = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      await fileService.restoreMulti(userID, items);

      res.send();
    } catch (e) {
      next(e);
    }
  };
}

export default FileController;
