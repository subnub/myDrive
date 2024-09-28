import FolderService from "../services/folder-service/folder-service";
import { NextFunction, Request, Response } from "express";
import ChunkService from "../services/chunk-service/chunk-service";

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
      const parent = req.body.parent;

      const folder = await folderService.createFolder(userID, name, parent);

      res.send(folder);
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
      const parentList = req.body.parentList;

      await chunkService.deleteFolder(userID, folderID);

      res.send();
    } catch (e) {
      next(e);
    }
  };

  getSubfolderFullList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const id: any = req.query.id;

      const subfolderList = await folderService.getSubfolderFullList(user, id);

      res.send(subfolderList);
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

  getSubfolderList = async (
    req: RequestType,
    res: Response,
    next: NextFunction
  ) => {
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

      const folderList = await folderService.getFolderList(user, query);

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

      await folderService.moveFolder(userID, folderID, parentID);

      res.send();
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
      const folderID = (req.query.folderID as string) || undefined;
      const currentParent = (req.query.currentParent as string) || undefined;

      console.log("folderID", folderID);

      const folderList = await folderService.getMoveFolderList(
        userID,
        parent,
        search,
        folderID,
        currentParent
      );

      res.send(folderList);
    } catch (e) {
      next(e);
    }
  };
}

export default FolderController;
