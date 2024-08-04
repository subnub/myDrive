import FolderService from "../services/FolderService";
import { Request, Response } from "express";
import ChunkService from "../services/ChunkService";

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

  createFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const name = req.body.name;
      const parent = req.body.parent;

      const folder = await folderService.createFolder(userID, name, parent);

      res.send(folder);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nUpload Folder Error Folder Route:", e.message);
      }
      res.status(500).send("Server error creating folder");
    }
  };

  deleteFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const parentList = req.body.parentList;

      await chunkService.deleteFolder(userID, folderID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDelete Folder Error Folder Route:", e.message);
      }

      res.status(500).send("Server error deleting folder");
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Subfolder List Error Folder Route:", e.message);
      }

      res.status(500).send("Server error getting subfolder full list");
    }
  };

  deleteAll = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;

      await chunkService.deleteAll(userID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDelete All Error Folder Route:", e.message);
      }

      res.status(500).send("Server error deleting all");
    }
  };

  getInfo = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.params.id;

      const folder = await folderService.getFolderInfo(userID, folderID);

      res.send(folder);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Info Error Folder Route:", e.message);
      }

      res.status(500).send("Server error getting user info");
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nServer error getting subfolder list", e.message);
      }

      res.status(500).send("");
    }
  };

  getFolderList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;

      const folderList = await folderService.getFolderList(user, query);

      res.send(folderList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Folder List Error Folder Route:", e.message);
      }

      res.status(500).send("Server error getting folder list");
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMove Folder Error Folder Route:", e.message);
      }

      res.status(500).send("Server error moving folder");
    }
  };

  trashFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;

      await folderService.trashFolder(userID, folderID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nTrash Folder Error Folder Route:", e.message);
      }

      res.status(500).send("Server error trashing folder");
    }
  };

  restoreFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;

      await folderService.restoreFolder(userID, folderID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("Restore Folder Error Folder Route:", e.message);
      }

      res.status(500).send("Server error restore folder");
    }
  };

  renameFolder = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const folderID = req.body.id;
      const title = req.body.title;

      await folderService.renameFolder(userID, folderID, title);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRename Folder Error Folder Route:", e.message);
      }

      res.status(500).send("Server error renaming folder");
    }
  };

  getMoveFolderList = async (req: RequestType, res: Response) => {
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Move Folder List Error Folder Route:", e.message);
      }

      res.status(500).send("Server error getting move folder list");
    }
  };
}

export default FolderController;
