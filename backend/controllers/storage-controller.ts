import disk from "diskusage";
import env from "../enviroment/env";
import { Request, Response } from "express";
import { UserInterface } from "../models/user-model";

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

class StorageController {
  constructor() {}

  getStorageInfo = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      if (!env.root || env.root.length === 0) {
        return;
      }

      const info = await disk.check(env.root!);

      res.send(info);
    } catch (e) {
      if (e instanceof Error) {
        console.log("\nGet Storage Error Storage Route:", e.message);
      }
      res.status(500).send("Server error getting storage info");
    }
  };
}

export default StorageController;
