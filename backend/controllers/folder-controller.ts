import FolderService from "../services/folder-service/folder-service";
import { NextFunction, Request, Response } from "express";
import ChunkService from "../services/chunk-service/chunk-service";
import { FolderListQueryType } from "../types/folder-types";
import { UserInterface } from "../models/user-model";

const folderService = new FolderService();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
}

const chunkService = new ChunkService();

class FolderController {
  constructor() {}

  createFolder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const name = req.body.name;
      const parent = req.body.parent || "/";

      const folder = await folderService.createFolder(userID, name, parent);

      res.status(201).send(folder);
    } catch (e) {
      next(e);
    }
  };

  deleteFolder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;

      await chunkService.deleteFolder(userID, folderID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  uploadFolder = async (
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

      await chunkService.uploadFolder(user, busboy, req);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  deleteAll = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await chunkService.deleteAll(userID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  getInfo = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.params.id;

      const folder = await folderService.getFolderInfo(userID, folderID);

      res.send(folder);
    } catch (e) {
      next(e);
    }
  };

  getFolderList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;

      const search = (query.search as string) || undefined;
      const parent = (query.parent as string) || "/";
      const sortBy = (query.sortBy as string) || "date_desc";
      const trashMode = query.trashMode === "true";

      const queryData: FolderListQueryType = {
        userID: user._id.toString(),
        search,
        parent,
        trashMode,
      };

      const folderList = await folderService.getFolderList(queryData, sortBy);

      res.send(folderList);
    } catch (e) {
      next(e);
    }
  };

  moveFolder = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const parentID = req.body.parentID;

      const folder = await folderService.moveFolder(userID, folderID, parentID);

      res.send(folder);
    } catch (e) {
      next(e);
    }
  };

  trashFolder = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;

      await folderService.trashFolder(userID, folderID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  restoreFolder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;

      await folderService.restoreFolder(userID, folderID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  renameFolder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const title = req.body.title;

      await folderService.renameFolder(userID, folderID, title);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  downloadZip = async (req: RequestType, res: Response, next: NextFunction) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderIDs = (req.query.folderIDs as string[]) || [];
      const fileIDs = (req.query.fileIDs as string[]) || [];

      await chunkService.downloadZip(userID, folderIDs, fileIDs, res);
    } catch (e) {
      next(e);
    }
  };

  getMoveFolderList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const parent = (req.query.parent as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const folderIDs = (req.query.folderIDs as string[]) || [];

      const folderList = await folderService.getMoveFolderList(
        userID,
        parent,
        search,
        folderIDs
      );

      res.send(folderList);
    } catch (e) {
      next(e);
    }
  };
}

export default FolderController;
