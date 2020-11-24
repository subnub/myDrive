import { Request, Response } from "express";
import {UserInterface} from "../models/user";
import GoogleFileService from "../services/GoogleFileService";

const googleFileService = new GoogleFileService();

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

class GoogleFileController {

    constructor() {

    }

    getList = async(req: RequestTypeFullUser, res: Response) => {


        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const query = req.query;

            const googleFiles = await googleFileService.getList(user, query);

            res.send(googleFiles)

        } catch (e) {
            console.log("Get Google File List Error", e);
            const code = 500;
            res.status(code).send()
        }
    }
    
    getMongoGoogleList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const query = req.query;

            const mongoGoogleFiles = await googleFileService.getMongoGoogleList(user, query);

            res.send(mongoGoogleFiles)

        } catch (e) {
            console.log("Get Mongo Google File List Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    getFileInfo = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const id: any = req.params.id;
            const user = req.user;

            const fileInfo = await googleFileService.getFileInfo(user, id);

            res.send(fileInfo);

        } catch (e) {
            console.log("Get Google File Info Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    getGoogleMongoQuickList = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;

            const googleMongoQuickList = await googleFileService.getGoogleMongoQuickList(user);

            res.send(googleMongoQuickList);

        } catch (e) {
            console.log("Get Google Mongo Quicklist error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    getGoogleMongoSuggestedList = async(req: RequestTypeFullUser, res: Response) => {
        
        if (!req.user) {
            return;
        }

        try {

            const user = req.user;

            const searchQuery: any = req.query.search || "";

            const fileAndFolderList = await googleFileService.getGoogleMongoSuggestedList(user, searchQuery);

            res.send(fileAndFolderList);

        } catch (e) {
            console.log("Get Google Mongo Suggested List error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    renameFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.body.id;
            const title = req.body.title

            await googleFileService.renameFile(user, fileID, title);

            res.send();

        } catch (e) {
            console.log("Rename Google File Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    removeFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try { 

            const fileID = req.body.id;
            const user = req.user!;

            await googleFileService.removeFile(user, fileID);

            res.send();

        } catch (e) {
            console.log("Remove Google File Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    downloadFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user!;
            const fileID = req.params.id;

            await googleFileService.downloadFile(user, fileID, res);

        } catch (e) {
            console.log("Download Google File Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    downloadDoc = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user;
            const fileID = req.params.id;

            await googleFileService.downloadDoc(user, fileID, res);

        } catch (e) {
            console.log("Download Google Doc Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    getThumbnail = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user;
            const fileID = req.params.id;

            await googleFileService.getThumbnail(user, fileID, res);

        } catch(e) {
            console.log("Get Google Thumbnail Error", e);
            const code = 500;
            res.status(code).send()
        }

    }

    getFulllThumbnail = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user;
            const fileID = req.params.id;

            await googleFileService.getFullThumbnail(user, fileID, res);

        } catch (e) {
            console.log("Get Google Full Thumbnail Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    streamVideo = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 
    
        try {

            const user = req.user!;
            const fileID = req.params.id;
            const tempUUID = req.params.uuid;

            await googleFileService.streamVideo(user, fileID, tempUUID, req, res);

        } catch (e) {
            console.log("Stream Google Video Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    uploadFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user;
            const busboy = req.busboy;
            
            req.pipe(busboy);

            await googleFileService.uploadFile(user, busboy, req, res);

        } catch (e) {
            console.log("Upload Google File Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    moveFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user!;
            const fileID = req.body.id;
            const parentID = req.body.parent;

            await googleFileService.moveFile(user, fileID, parentID);

            res.send();

        } catch (e) {
            console.log("Move Google File Error", e);
            const code = 500;
            res.status(code).send()
        }

    }

    makeFilePublic = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user;
            const fileID = req.params.id;

            const publicURL = await googleFileService.makeFilePublic(user, fileID);

            res.send(publicURL);

        } catch (e) {
            console.log("Make Google File Public Error", e);
            const code = 500;
            res.status(code).send()
        }
    }

    removePublicLink = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        } 

        try {

            const user = req.user!;
            const fileID = req.params.id;

            await googleFileService.removePublicLink(user, fileID);

            res.send();

        } catch (e) {
            console.log("Remove Google File Public Error", e);
            const code = 500;
            res.status(code).send()
        }
    }
}

export default GoogleFileController;