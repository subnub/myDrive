import { Request, Response } from "express";
import FileService from "../services/FileService";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";
import {UserInterface} from "../models/user";
import uuid from "uuid";
import tempStorage from "../tempStorage/tempStorage";

const fileService = new FileService()

interface RequestType extends Request {
    user?: UserInterface,
    auth?: boolean,
    busboy: any,
}

type ChunkServiceType = MongoService | FileSystemService | S3Service;

class FileController {

    chunkService: ChunkServiceType;

    constructor(chunkService: ChunkServiceType) {

        this.chunkService = chunkService;
    }

    getThumbnail = async(req: RequestType, res: Response) => {


        if (!req.user) {

            return;
        }
    
        try {
            
    
            const user = req.user;
            const id = req.params.id;
    
            const decryptedThumbnail = await this.chunkService.getThumbnail(user, id);
        

            res.send(decryptedThumbnail);
    
        } catch (e) {

            const code = e.code || 500;
            
            console.log(e);
            res.status(code).send();
        }

    }

    getFullThumbnail = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.params.id;

            await this.chunkService.getFullThumbnail(user, fileID, res);

        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    uploadFile = async(req: RequestType, res: Response) => {

        if (!req.user) {
        
            return 
        }
    
        try {

            const user = req.user;
            const busboy = req.busboy;
            
            req.pipe(busboy);
    
            const file = await this.chunkService.uploadFile(user, busboy, req);
         
            res.send(file);
            
            console.log("file uploaded");
    
        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    getPublicDownload = async(req: RequestType, res: Response) => {

        try {

            const ID = req.params.id;
            const tempToken = req.params.tempToken;
    
            await this.chunkService.getPublicDownload(ID, tempToken, res);
    
        } catch (e) {
    
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    removeLink = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const id = req.params.id;
            const userID = req.user._id;
    
            await fileService.removeLink(userID, id)
    
            res.send();
    
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send();
        }

    }

    makePublic = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {

            const fileID = req.params.id;
            const user = req.user;
    
            const token = await fileService.makePublic(user, fileID);

            res.send(token);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send();
        }
    }

    getPublicInfo = async(req: RequestType, res: Response) => {

        try {

            const id = req.params.id;
            const tempToken = req.params.tempToken;
            
            const file = await fileService.getPublicInfo(id, tempToken);

            res.send(file);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    makeOneTimePublic = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const id = req.params.id;
            const userID = req.user._id;
            
            const token = await fileService.makeOneTimePublic(userID, id);

            res.send(token);

        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }

    }

    getFileInfo = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.params.id;
            const userID = req.user._id;
    
            const file = await fileService.getFileInfo(userID, fileID);
    
            res.send(file);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    getQuickList = async(req: RequestType, res: Response) => { 

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;

            const quickList = await fileService.getQuickList(userID);

            res.send(quickList);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    getList = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return
        }
    
        try {

            const query = req.query;
            const userID = req.user._id;
            
            const fileList = await fileService.getList(userID, query);

            res.send(fileList);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    getDownloadToken = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return 
        }
    
        try {

            const user = req.user;

            const tempToken = await fileService.getDownloadToken(user);
    
            res.send({tempToken});
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    getDownloadTokenVideo = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return 
        }
    
        try {
    
            const user = req.user;
            const cookie = req.headers.uuid as string;
    
            const tempToken = await fileService.getDownloadTokenVideo(user, cookie);
    
            res.send({tempToken});
    
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    removeTempToken = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return 
        }
    
        try {

            const user = req.user
            const tempToken = req.params.tempToken;
            const currentUUID = req.params.uuid;

            await fileService.removeTempToken(user, tempToken, currentUUID);

            res.send();
            
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    streamVideo = async(req: RequestType, res: Response) => {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            const user = req.user;
            const fileID = req.params.id;
            const headers = req.headers;

            //tempStorage[req.params.uuid] = uuid.v4();
            
            console.log("stream request 2", tempStorage);

            // req.on("close", () => {
            //     console.log("req closed stream");
            // })

            // req.on("abort", () => {
            //     console.log("Aborted");
            // })
    
            await this.chunkService.streamVideo(user, fileID, headers, res, req);
    
            //console.log("stream finished");

        } catch (e) {

            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        }

    }

    downloadFile = async(req: RequestType, res: Response) => {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            console.log("download request")

            const user = req.user;
            const fileID = req.params.id;

            await this.chunkService.downloadFile(user, fileID, res);
    
        } catch (e) {
            
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    getSuggestedList = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            let searchQuery = req.query.search || "";
    
            const {fileList, folderList} = await fileService.getSuggestedList(userID, searchQuery);
    
            return res.send({folderList, fileList})
    
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    renameFile = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.body.id;
            const title = req.body.title
            const userID = req.user._id;
    
            await fileService.renameFile(userID, fileID, title)

            res.send();
            
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    
    }

    moveFile = async(req: RequestType, res: Response) => {

        console.log("move request");

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.body.id;
            const userID = req.user._id;
            const parentID = req.body.parent;
    
            console.log(fileID, userID, parentID);

            await fileService.moveFile(userID, fileID, parentID);

            res.send();
            
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }

    }

    deleteFile = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const fileID = req.body.id;
    
            await this.chunkService.deleteFile(userID, fileID);
    
            res.send()
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }
}

export default FileController;
