import FolderService from "../services/FolderService";
import { Request, Response } from "express";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";

const folderService = new FolderService();

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

interface RequestType extends Request {
    user?: userAccessType,
    encryptedToken?: string
}

type ChunkServiceType = MongoService | FileSystemService | S3Service;

class FolderController {

    chunkService: ChunkServiceType;

    constructor(chunkService: ChunkServiceType) {

        this.chunkService = chunkService;
    }

    uploadFolder = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {

            const data = req.body;

            const folder = await folderService.uploadFolder(data);

            res.send(folder);
    
        } catch (e) {

            console.log("\nUpload Folder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    deleteFolder = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.body.id; 
            const parentList = req.body.parentList

            await this.chunkService.deleteFolder(userID, folderID, parentList);
    
            res.send();

        } catch (e) {
            
            console.log("\nDelete Folder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getSubfolderFullList = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return 
        }

        try {


            const user = req.user;
            const id: any = req.query.id;

            const subfolderList = await folderService.getSubfolderFullList(user, id);

            res.send(subfolderList);

        } catch (e) {
           
            console.log("\nGet Subfolder List Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    deletePersonalFolder = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.body.id; 
            const parentList = req.body.parentList

            const s3Service = new S3Service();

            await s3Service.deleteFolder(userID, folderID, parentList);
    
            res.send();

        } catch (e) {
            
            console.log("\nDelete Personal Folder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    deleteAll = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;

            await this.chunkService.deleteAll(userID);

            res.send();

        } catch (e) {
           
            console.log("\nDelete All Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getInfo = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.params.id;
    
            const folder = await folderService.getFolderInfo(userID, folderID);
    
            res.send(folder);
    
        } catch (e) {

            console.log("\nGet Info Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getSubfolderList = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return
        } 
    
        try {
    
            const userID = req.user._id;
            const folderID = req.query.id as string;
            
            const {folderIDList, folderNameList} = await folderService.getFolderSublist(userID, folderID);
            
            res.send({folderIDList, folderNameList})    
    
        } catch (e) {
            
            console.log("\nGet Subfolder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getFolderList = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {
    
            const user = req.user;
            const query = req.query;

            const folderList = await folderService.getFolderList(user, query);

            res.send(folderList);

        } catch (e) {
            
            console.log("\nGet Folder List Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    moveFolder = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;
            const folderID = req.body.id;
            const parent = req.body.parent;

            await folderService.moveFolder(userID, folderID, parent);

            res.send();

        } catch (e) {

            console.log("\nMove Folder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    renameFolder = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.body.id;
            const title = req.body.title
    
            await folderService.renameFolder(userID, folderID, title);
    
            res.send()
            
        } catch (e) {
    
            console.log("\nRename Folder Error Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
}

export default FolderController;