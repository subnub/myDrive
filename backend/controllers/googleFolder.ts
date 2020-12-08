import { Request, Response } from "express";
import {UserInterface} from "../models/user";
import GoogleFolderService from "../services/GoogleFolderService";
import { googleQueryType } from "../utils/createQueryGoogle";

const googleFolderService = new GoogleFolderService();

interface RequestTypeFullUser extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

class GoogleFolderController {

    constructor() {
        
    }

    getList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const query = req.query as unknown as googleQueryType;

            const folderList = await googleFolderService.getList(user, query);

            res.send(folderList);

        } catch (e) {
            
            console.log("\nGet Google List Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getGoogleMongoList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const query = req.query;

            const folderList = await googleFolderService.getGoogleMongoList(user, query);

            res.send(folderList);

        } catch (e) {
           
            console.log("\nGet Google/Mongo List Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getInfo = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const id = req.params.id;

            const folderInfo = await googleFolderService.getInfo(user, id);

            res.send(folderInfo);

        } catch (e) {
            
            console.log("\nGet Info Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getSubFolderList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const id: any = req.query.id;

            const nameAndIDList = await googleFolderService.getSubFolderList(user, id);

            res.send(nameAndIDList);

        } catch (e) {
            
            console.log("\nGet Subfolder List Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }

    }

    getSubfolderFullList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const id: any = req.query.id;

            const fullSubfolderList = await googleFolderService.getSubFolderFullList(user, id);

            res.send(fullSubfolderList);

        } catch (e) {
            
            console.log("\nGet Full Subfolder List Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    renameFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const folderID = req.body.id;
            const title = req.body.title

            await googleFolderService.renameFolder(user, folderID, title);

            res.send();

        } catch (e) {
            
            console.log("\nRename Folder Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    removeFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const folderID = req.body.id;

            await googleFolderService.removeFolder(user, folderID)

            res.send();

        } catch (e) {
            
            console.log("\nRemove Folder Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    upload = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            let {name, parent} = req.body;

            const createdFolder = await googleFolderService.upload(user, name, parent);

            res.send(createdFolder);

        } catch (e) {
            
            console.log("\nUpload Folder Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    moveFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const folderID = req.body.id;
            const parentID = req.body.parent;

            await googleFolderService.moveFolder(user, folderID, parentID);

            res.send();

        } catch (e) {
            
            console.log("\nMove Folder Error Google Folder Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    } 
}

export default GoogleFolderController;