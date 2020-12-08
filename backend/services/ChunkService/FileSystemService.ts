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
import awaitUploadStreamFS from "./utils/awaitUploadStreamFS";
import File, { FileInterface } from "../../models/file";
import getFileSize from "./utils/getFileSize";
import DbUtilFile from "../../db/utils/fileUtils/index";
import awaitStream from "./utils/awaitStream";
import createThumbnailAny from "./utils/createThumbailAny";
import imageChecker from "../../utils/imageChecker";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import streamToBuffer from "../../utils/streamToBuffer";
import User from "../../models/user";
import env from "../../enviroment/env";
import removeChunksFS from "./utils/removeChunksFS";
import getPrevIVFS from "./utils/getPrevIVFS";
import awaitStreamVideo from "./utils/awaitStreamVideo";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import Folder, { FolderInterface } from "../../models/folder";
import addToStoageSize from "./utils/addToStorageSize";
import subtractFromStorageSize from "./utils/subtractFromStorageSize";
import ForbiddenError from "../../utils/ForbiddenError";
import { ObjectID } from "mongodb";

const dbUtilsFile = new DbUtilFile();

class FileSystemService implements ChunkInterface {

    constructor() {
        
    }

    uploadFile = async(user: UserInterface, busboy: any, req: Request) => {


        const password = user.getEncryptionKey(); 

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const {file, filename, formData} = await getBusboyData(busboy);

        const parent = formData.get("parent") || "/"
        const parentList = formData.get("parentList") || "/";
        const size = formData.get("size") || ""
        const personalFile = formData.get("personal-file") ? true : false;
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
            filePath: env.fsDirectory + systemFileName
        }

        const fileWriteStream = fs.createWriteStream(metadata.filePath);

        const totalStreamsToErrorCatch = [file, cipher, fileWriteStream];

        await awaitUploadStreamFS(file.pipe(cipher), fileWriteStream, req, metadata.filePath, totalStreamsToErrorCatch);

        const date = new Date();
        const encryptedFileSize = await getFileSize(metadata.filePath);
        
        const currentFile = new File({
            filename,
            uploadDate: date.toISOString(),
            length: encryptedFileSize,
            metadata
        });

        await currentFile.save();

        await addToStoageSize(user, size, personalFile);

        const imageCheck = imageChecker(currentFile.filename);
 
        if (currentFile.length < 15728640 && imageCheck) {

            const updatedFile = await createThumbnailAny(currentFile, filename, user);

            return updatedFile;
           
        } else {

            return currentFile;
        }
        
    }

    getFileWriteStream = async(user: UserInterface, file: FileInterface, parentFolder: FolderInterface) => {

        const password = user.getEncryptionKey(); 

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const initVect = crypto.randomBytes(16);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);

        const filename = file.filename
        const parent = parentFolder._id
        const parentList = [...parentFolder.parentList, parentFolder._id]
        const size = file.metadata.size
        const personalFile = file.metadata.personalFile ? true : false
        let hasThumbnail = file.metadata.hasThumbnail;
        let thumbnailID = file.metadata.thumbnailID
        const isVideo = file.metadata.isVideo

        const systemFileName = uuid.v4();

        const metadata = {
            owner: user._id,
            parent,
            parentList,
            hasThumbnail,
            thumbnailID,
            isVideo,
            size,
            IV: file.metadata.IV,
            filePath: env.fsDirectory + systemFileName
        }

        const fileWriteStream = fs.createWriteStream(metadata.filePath);

        return fileWriteStream;

    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const filePath = currentFile.metadata.filePath!;

        const IV = currentFile.metadata.IV.buffer as Buffer;
      
        const readStream = fs.createReadStream(filePath);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
        res.set('Content-Length', currentFile.metadata.size.toString()); 

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
    }

    getFileReadStream = async(user: UserInterface, fileID: string) => {

        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const filePath = currentFile.metadata.filePath!;

        const IV = currentFile.metadata.IV.buffer as Buffer;
      
        const readStream = fs.createReadStream(filePath);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        return readStream
    }

    getThumbnail = async(user: UserInterface, id: string) => {

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const thumbnail = await Thumbnail.findById(new ObjectID(id)) as ThumbnailInterface;
    
        if (thumbnail.owner !== user._id.toString()) {

            throw new ForbiddenError('Thumbnail Unauthorized Error');
        }

        const iv = thumbnail.IV!;
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
        
        const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, iv);

        const readStream = fs.createReadStream(thumbnail.path!);

        const allStreamsToErrorCatch = [readStream, decipher];

        const bufferData = await streamToBuffer(readStream.pipe(decipher), allStreamsToErrorCatch);

        return bufferData;
         
    }

    getFullThumbnail = async(user: UserInterface, fileID: string, res: Response) => {

        const userID = user._id;

        const file: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!file) throw new NotFoundError("File Thumbnail Not Found");

        const password = user.getEncryptionKey();
        const IV = file.metadata.IV.buffer as Buffer;

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const readStream = fs.createReadStream(file.metadata.filePath!);

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
    }

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response, req: Request) => {

        // To get this all working correctly with encryption and across
        // All browsers took many days, tears, and some of my sanity. 
        // Shoutout to Tyzoid for helping me with the decryption
        // And and helping me understand how the IVs work.
        
        // P.S I hate safari >:(
        // Why do yall have to be weird with video streaming
        // 90% of the issues with this are only in Safari
        // Is safari going to be the next internet explorer?

        const userID = user._id;
        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!currentFile) throw new NotFoundError("Video File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key")

        const fileSize = currentFile.metadata.size;
                    
        const range = headers.range
        const parts = range.replace(/bytes=/, "").split("-")
        let start = parseInt(parts[0], 10)
        let end = parts[1] 
            ? parseInt(parts[1], 10)
            : fileSize-1
        const IV = currentFile.metadata.IV.buffer as Buffer;
        const chunksize = (end-start)+1

        let head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'}

        let currentIV = IV;

        let fixedStart = 0;
        let fixedEnd = currentFile.length;

        if (start === 0 && end === 1) {
            
            // This is for Safari/iOS, Safari will request the first
            // Byte before actually playing the video. Needs to be 
            // 16 bytes.

            fixedStart = 0;
            fixedEnd = 15;    

        } else {

            // If you're a normal browser, or this isn't Safari's first request
            // We need to make it so start is divisible by 16, since AES256
            // Has a block size of 16 bytes.

            fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);
        }

        if (+start === 0) {
            
            // This math will not work if the start is 0
            // So if it is we just change fixed start back
            // To 0.

            fixedStart = 0;
        }
    
        
        // We also need to calculate the difference between the start and the 
        // Fixed start position. Since there will be an offset if the original
        // Request is not divisible by 16, it will not return the right part
        // Of the file, you will see how we do this in the awaitStreamVideo
        // code.

        const differenceStart = start - fixedStart;


        if (fixedStart !== 0 && start !== 0) {

            // If this isn't the first request, the way AES256 works is when you try to
            // Decrypt a certain part of the file that isn't the start, the IV will 
            // Actually be the 16 bytes ahead of where you are trying to 
            // Start the decryption.
    
            currentIV = await getPrevIVFS(fixedStart - 16, currentFile.metadata.filePath!) as Buffer;
        }

        const readStream = fs.createReadStream(currentFile.metadata.filePath!, {
            start: fixedStart,
            end: fixedEnd,
        });

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, currentIV);

        decipher.setAutoPadding(false);

        res.writeHead(206, head);

        const allStreamsToErrorCatch = [readStream, decipher];

        readStream.pipe(decipher);

        await awaitStreamVideo(start, end, differenceStart, decipher, res, req, allStreamsToErrorCatch, readStream);

        readStream.destroy();
    }

    getPublicDownload = async(fileID: string, tempToken: any, res: Response) => {

        const file: FileInterface = await dbUtilsFile.getPublicFile(fileID);

        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
            throw new NotAuthorizedError("File Not Public");
        }

        const user = await User.findById(file.metadata.owner) as UserInterface;

        const password = user.getEncryptionKey();

        if (!password) throw new ForbiddenError("Invalid Encryption Key");

        const IV = file.metadata.IV.buffer as Buffer;
                   
        const readStream = fs.createReadStream(file.metadata.filePath!);
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
    
        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);

        if (file.metadata.linkType === "one") {
            await dbUtilsFile.removeOneTimePublicLink(fileID);
        }
    }

    deleteFile = async(userID: string, fileID: string) => {

        const file: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);
    
        if (!file) throw new NotFoundError("Delete File Not Found Error");
    
        if (file.metadata.thumbnailID) {

            const thumbnail = await Thumbnail.findById(file.metadata.thumbnailID) as ThumbnailInterface;
            const thumbnailPath = thumbnail.path!;
            await removeChunksFS(thumbnailPath);
    
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }

        await removeChunksFS(file.metadata.filePath!);
        await File.deleteOne({_id: file._id});
        await subtractFromStorageSize(userID, file.length, file.metadata.personalFile!)
    }

    deleteFolder = async(userID: string, folderID: string, parentList: string[]) => {

        const parentListString = parentList.toString()
    
        await Folder.deleteMany({"owner": userID, "parentList": { $all: parentList}})
        await Folder.deleteMany({"owner": userID, "_id": folderID});

        const fileList = await dbUtilsFile.getFileListByParent(userID, parentListString);
    
        if (!fileList) throw new NotFoundError("Delete File List Not Found");
        
        for (let i = 0; i < fileList.length; i++) {

            const currentFile = fileList[i];

            try {
                
                if (currentFile.metadata.thumbnailID) {

                    const thumbnail = await Thumbnail.findById(currentFile.metadata.thumbnailID) as ThumbnailInterface;
                    const thumbnailPath = thumbnail.path!;
                    await removeChunksFS(thumbnailPath);
                    
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
                    
                await removeChunksFS(currentFile.metadata.filePath!);
                await File.deleteOne({_id: currentFile._id});

            } catch (e) {

                console.log("Could not delete file", currentFile.filename, currentFile._id);
            }
           
        } 
    }

    deleteAll = async(userID: string) => {

        await Folder.deleteMany({"owner": userID});

        const fileList = await dbUtilsFile.getFileListByOwner(userID);

        if (!fileList) throw new NotFoundError("Delete All File List Not Found Error");

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];

            try {

                if (currentFile.metadata.thumbnailID) {

                    const thumbnail = await Thumbnail.findById(currentFile.metadata.thumbnailID) as ThumbnailInterface;
                    const thumbnailPath = thumbnail.path!;
                    await removeChunksFS(thumbnailPath);
                    
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
    
                await removeChunksFS(currentFile.metadata.filePath!);
                await File.deleteOne({_id: currentFile._id});

            } catch (e) {

                console.log("Could Not Remove File", currentFile.filename, currentFile._id);
            }
        }
    }
}

export default FileSystemService;