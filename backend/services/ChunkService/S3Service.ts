import File, { FileInterface } from "../../models/file";
import User, {UserInterface} from "../../models/user";
import s3 from "../../db/s3";
import env from "../../enviroment/env";
import { Response, Request } from "express";
import ChunkInterface from "./utils/ChunkInterface";
import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import crypto from "crypto";
import getBusboyData from "./utils/getBusboyData";
import videoChecker from "../../utils/videoChecker";
import uuid from "uuid";
import awaitUploadStreamS3 from "./utils/awaitUploadStreamS3";
import awaitStream from "./utils/awaitStream";
import createThumbnailS3 from "./utils/createThumbnailS3";
import imageChecker from "../../utils/imageChecker";
import Thumbnail, {ThumbnailInterface} from "../../models/thumbnail";
import streamToBuffer from "../../utils/streamToBuffer";
import removeChunksS3 from "./utils/removeChunksS3";
import fixStartChunkLength from "./utils/fixStartChunkLength";
import fixEndChunkLength from "./utils/fixEndChunkLength";
import getPrevIVS3 from "./utils/getPrevIVS3";
import awaitStreamVideo from "./utils/awaitStreamVideo";
import Folder from "../../models/folder";

import DbUtilFile from "../../db/utils/fileUtils/index";
const dbUtilsFile = new DbUtilFile();

class S3Service implements ChunkInterface {

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

        const randomS3ID = uuid.v4();
            
        const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: initVect,
                s3ID: randomS3ID
        }

        const params = {
            Bucket: env.s3Bucket,
            Body : file.pipe(cipher),
            Key : randomS3ID
        };

        await awaitUploadStreamS3(params);

        const date = new Date();
        const encryptedFileSize = size;
        
        const currentFile = new File({
            filename,
            uploadDate: date.toISOString(),
            length: encryptedFileSize,
            metadata
        });

        await currentFile.save();

        const imageCheck = imageChecker(currentFile.filename);
 
        if (currentFile.length < 15728640 && imageCheck) {

            console.log("Creating thumbnail...")
            const updatedFile = await createThumbnailS3(currentFile, filename, user);

            return updatedFile;
           
        } else {

            return currentFile;
        }
    } 

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => { 

        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, user._id);

        if (!currentFile) throw new NotFoundError("Download File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const IV = currentFile.metadata.IV.buffer as Buffer;

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
        res.set('Content-Length', currentFile.metadata.size.toString()); 

        const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!};

        const s3ReadStream = s3.getObject(params).createReadStream();

        const allStreamsToErrorCatch = [s3ReadStream, decipher];

        await awaitStream(s3ReadStream.pipe(decipher), res, allStreamsToErrorCatch);

    }

    streamVideo = async(user: UserInterface, fileID: string, headers: any, res: Response, req: Request) => { 

        const userID = user._id;
        const currentFile: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);

        if (!currentFile) throw new NotFoundError("Video File Not Found");

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const fileSize = currentFile.metadata.size;
                    
        const range = headers.range
        const parts = range.replace(/bytes=/, "").split("-")
        let start = parseInt(parts[0], 10)
        let end = parts[1] 
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const IV = currentFile.metadata.IV.buffer as Buffer;
                
        let head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'}

        let currentIV = IV;

        let fixedStart = start % 16 === 0 ? start : fixStartChunkLength(start);
    
        if (+start === 0) {
        
            fixedStart = 0;
        }
    
        const fixedEnd = fileSize % 16 === 0 ? fileSize : fixEndChunkLength(fileSize); //end % 16 === 0 ? end + 15: (fixEndChunkLength(end) - 1) + 16;
        
        const differenceStart = start - fixedStart;
    
        if (fixedStart !== 0 && start !== 0) {
        
            currentIV = await getPrevIVS3(fixedStart - 16, currentFile.metadata.s3ID!) as Buffer;
        }

        const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!, Range: `bytes=${fixedStart}-${fixedEnd}`};

        const s3ReadStream = s3.getObject(params).createReadStream();

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, currentIV);

        res.writeHead(206, head);

        const allStreamsToErrorCatch = [s3ReadStream, decipher];

        s3ReadStream.pipe(decipher);

        const tempUUID = req.params.uuid;

        // s3ReadStream.on("data", () => {
        //     console.log("data", tempUUID);
        // })

        
        // req.on("close", () => {
        //     // console.log("Destoying read stream");
        //     // s3ReadStream.destroy();
        //     // console.log("Read Stream Destroyed");
        // })

        // req.on("end", () => {
        //     console.log("ending stream");
        //     s3ReadStream.destroy();
        //     console.log("ended stream")
        // })

        // req.on("error", () => {
        //     console.log("req error");
        // })

        // req.on("pause", () => {
        //     console.log("req pause")
        // })

        // req.on("close", () => {
        //     // console.log("req closed");
        //     s3ReadStream.destroy();
        // })

        //req.on("")

        // req.on("end", () => {
        //     console.log("req end");
        // })

        await awaitStreamVideo(start, end, differenceStart, decipher, res, req, tempUUID, allStreamsToErrorCatch);
        console.log("Video stream finished");
        s3ReadStream.destroy();
    }

    getThumbnail = async(user: UserInterface, id: string) => { 

         const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const thumbnail = await Thumbnail.findById(id) as ThumbnailInterface;
    
        if (thumbnail.owner !== user._id.toString()) {

            throw new NotAuthorizedError('Thumbnail Unauthorized Error');
        }

        const iv = thumbnail.IV!;
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
        
        const decipher = crypto.createDecipheriv("aes256", CIPHER_KEY, iv);

        const params: any = {Bucket: env.s3Bucket, Key: thumbnail.s3ID!};

        const readStream = s3.getObject(params).createReadStream();

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

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key")

        const params: any = {Bucket: env.s3Bucket, Key: file.metadata.s3ID!};

        const readStream = s3.getObject(params).createReadStream();

        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        
    
        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        console.log("Sending Full Thumbnail...")
        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);
        console.log("Full thumbnail sent");
    }

    getPublicDownload = async(fileID: string, tempToken: any, res: Response) => {

        const file: FileInterface = await dbUtilsFile.getPublicFile(fileID);

        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
            throw new NotAuthorizedError("File Not Public");
        }

        const user = await User.findById(file.metadata.owner) as UserInterface;

        const password = user.getEncryptionKey();

        if (!password) throw new NotAuthorizedError("Invalid Encryption Key");

        const IV = file.metadata.IV.buffer as Buffer;
                   
        const params: any = {Bucket: env.s3Bucket, Key: file.metadata.s3ID!};

        const readStream = s3.getObject(params).createReadStream();
        
        const CIPHER_KEY = crypto.createHash('sha256').update(password).digest()        

        const decipher = crypto.createDecipheriv('aes256', CIPHER_KEY, IV);
    
        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        res.set('Content-Length', file.metadata.size.toString());

        const allStreamsToErrorCatch = [readStream, decipher];

        await awaitStream(readStream.pipe(decipher), res, allStreamsToErrorCatch);

        if (file.metadata.linkType === "one") {
            console.log("removing public link");
            await dbUtilsFile.removeOneTimePublicLink(fileID);
        }
    }

    deleteFile = async(userID: string, fileID: string) => {

        const file: FileInterface = await dbUtilsFile.getFileInfo(fileID, userID);
    
        if (!file) throw new NotFoundError("Delete File Not Found Error");
    
        if (file.metadata.thumbnailID) {

            const thumbnail = await Thumbnail.findById(file.metadata.thumbnailID) as ThumbnailInterface;
            const paramsThumbnail: any = {Bucket: env.s3Bucket, Key: thumbnail.s3ID!};
            await removeChunksS3(paramsThumbnail);
            await Thumbnail.deleteOne({_id: file.metadata.thumbnailID});
        }

        const params: any = {Bucket: env.s3Bucket, Key: file.metadata.s3ID!};
        await removeChunksS3(params);
        await File.deleteOne({_id: file._id});
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
                    const paramsThumbnail: any = {Bucket: env.s3Bucket, Key: thumbnail.s3ID!};
                    await removeChunksS3(paramsThumbnail);
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
                    
                const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!};
                await removeChunksS3(params);
                await File.deleteOne({_id: currentFile._id});

            } catch (e) {

                console.log("Could not delete file", currentFile.filename, currentFile._id);
            }
           
        } 
    }

    deleteAll = async(userID: string) => {

        console.log("remove all request")

        await Folder.deleteMany({"owner": userID});

        const fileList = await dbUtilsFile.getFileListByOwner(userID);

        if (!fileList) throw new NotFoundError("Delete All File List Not Found Error");

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];

            try {

                if (currentFile.metadata.thumbnailID) {

                    const thumbnail = await Thumbnail.findById(currentFile.metadata.thumbnailID) as ThumbnailInterface;
                    const paramsThumbnail: any = {Bucket: env.s3Bucket, Key: thumbnail.s3ID!};
                    await removeChunksS3(paramsThumbnail);
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
    
                const params: any = {Bucket: env.s3Bucket, Key: currentFile.metadata.s3ID!};
                await removeChunksS3(params);
                await File.deleteOne({_id: currentFile._id});

            } catch (e) {

                console.log("Could Not Remove File", currentFile.filename, currentFile._id);
            }
        }
    }
}

export default S3Service;