import { Request, Response } from "express";
import {UserInterface} from "../models/user";
import GoogleFolderService from "../services/GoogleFolderService";

const googleFolderService = new GoogleFolderService();

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

interface RequestTypeRefresh extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

interface RequestTypeFullUser extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

interface RequestType extends Request {
    user?: userAccessType,
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
            const query = req.query;

            const folderList = await googleFolderService.getList(user, query);

            res.send(folderList);

        } catch (e) {
            console.log("Get Google Folder List Error", e);
            const code = 500;
            res.status(code).send()
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
            console.log("Get Google Mongo Folder List Error", e);
            const code = 500;
            res.status(code).send()
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
            console.log("Get Google Info Error", e);
            const code = 500;
            res.status(code).send()
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
            console.log("Get Google Subfolder Error", e);
            const code = 500;
            res.status(code).send()
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
            console.log("Get Google Full Subfolder Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    renameFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.body.id;
            const title = req.body.title

            await googleFolderService.renameFolder(user, fileID, title);

            res.send();

        } catch (e) {
            console.log("Rename Google Folder Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    removeFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.body.id;

            await googleFolderService.removeFolder(user, fileID)

            res.send();

        } catch (e) {
            console.log("Remove Google Folder Error", e);
            const code = 500;
            res.status(code).send()
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
            console.log("Upload Google Folder Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    moveFolder = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.body.id;
            const parentID = req.body.parent;

            await googleFolderService.moveFolder(user, fileID, parentID);

            res.send();

        } catch (e) {
            console.log("Move Folder Google Error", e);
            const code = 500;
            res.status(code).send() 
        }
    } 
}

export default GoogleFolderController;