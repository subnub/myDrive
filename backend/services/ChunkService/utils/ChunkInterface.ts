import { UserInterface } from "../../../models/user";
import { FileInterface } from "../../../models/file";
import { Request, Response } from "express";

interface ChunkInterface {
    uploadFile: (user: UserInterface, busboy: any, req: Request) => Promise<FileInterface>;
    downloadFile: (user: UserInterface, fileID: string, res: Response) => void;
    getThumbnail: (user: UserInterface, id: string) => Promise<Buffer>;
    getFullThumbnail: (user: UserInterface, fileID: string, res: Response) => void;
    getPublicDownload: (fileID: string, tempToken: any, res: Response) => void;
    streamVideo: (user: UserInterface, fileID: string, headers: any, res: Response, req: Request) => void;
    getFileReadStream: (user: UserInterface, fileID: string) => any
}

export default ChunkInterface;