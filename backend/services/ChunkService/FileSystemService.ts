import { Response, Request } from "express";
import ChunkInterface from "./utils/ChunkInterface";
import { UserInterface } from "../../models/user";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import crypto from "crypto";
import getBusboyData from "./utils/getBusboyData";
import videoChecker from "../../utils/videoChecker";
import fs from "fs";
import uuid from "uuid";
import awaitUploadStream from "./utils/awaitUploadStream";
import File, { FileInterface } from "../../models/file";
import getFileSize from "./utils/getFileSize";
import DbUtilFile from "../../db/utils/fileUtils/index";
import awaitStream from "./utils/awaitStream";

const dbUtilsFile = new DbUtilFile();

// implements ChunkInterface
class FileSystemService  {

    constructor() {
        
    }

    uploadFile = async(user: UserInterface, busboy: any, req: Request) => {


        const password = user.getEncryptionKey(); 

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")


        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const {file, filename, formData} = await getBusboyData(busboy);

        const parent = formData.get("parent") || "/"
        const parentList = formData.get("parentList") || "/";
        const size = formData.get("size") || ""
        let hasThumbnail = false;
        let thumbnailID = ""
        const isVideo = videoChecker(filename)

        const systemFileName = uuid.v4();

        const metadata = {
            owner: user._id,
            parent,
            parentList,
            hasThumbnail,
            thumbnailID,
            isVideo,
            size,
            IV: initVect,
            filePath: `/Users/kylehoell/Documents/fstestdata/${systemFileName}`
        }

        const fileWriteStream = fs.createWriteStream(metadata.filePath);

        await awaitUploadStream(file.pipe(cipher), fileWriteStream, req);

        const date = new Date();
        const encryptedFileSize = await getFileSize(metadata.filePath);
        
        const currentFile = new File({
            filename,
            uploadDate: date.toISOString(),
            length: encryptedFileSize,
            metadata
        });

        await currentFile.save();

        console.log(currentFile);

        return currentFile;
        
    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const filePath = currentFile.metadata.filePath!;

        const IV = currentFile.metadata.IV.buffer
      
        const readStream = fs.createReadStream(filePath);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
        res.set('Content-Length', currentFile.metadata.size.toString()); 

        await awaitStream(readStream.pipe(decipher), res);
    }
}

export default FileSystemService;