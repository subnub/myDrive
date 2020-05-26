import FolderService from "../services/FolderService";
import { Request, Response } from "express";
import {UserInterface} from "../models/user";
import MongoService from "../services/ChunkService/MongoService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";

const folderService = new FolderService();

interface RequestType extends Request {
    user?: UserInterface,
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

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
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
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
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
           
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
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

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
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
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    getFolderList = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;
            const query = req.query;

            const folderList = await folderService.getFolderList(userID, query);

            res.send(folderList);

        } catch (e) {
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
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

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);

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
    
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
    
        }
    }
}

export default FolderController;