import { UserInterface } from "../../../models/user-model";
import { FileInterface } from "../../../models/file-model";
import { Request, Response } from "express";
import { FolderInterface } from "../../../models/folder-model";
import crypto from "crypto";

interface ChunkInterface {
  uploadFile: (
    user: UserInterface,
    busboy: any,
    req: Request
  ) => Promise<FileInterface>;
  downloadFile: (user: UserInterface, fileID: string, res: Response) => void;
  getThumbnail: (user: UserInterface, id: string) => Promise<Buffer>;
  getFullThumbnail: (
    user: UserInterface,
    fileID: string,
    res: Response
  ) => void;
  getPublicDownload: (fileID: string, tempToken: any, res: Response) => void;
  streamVideo: (
    user: UserInterface,
    fileID: string,
    headers: any,
    res: Response,
    req: Request
  ) => void;
  getFileReadStream: (user: UserInterface, fileID: string) => any;
  trashMulti: (
    userID: string,
    items: {
      type: "file" | "folder";
      id: string;
      file?: FileInterface;
      folder?: FolderInterface;
    }[]
  ) => Promise<void>;
}

export default ChunkInterface;
