import S3Service from "../services/ChunkService/S3Service";
import { Request, Response } from "express";
import {UserInterface} from "../models/user";

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

interface RequestTypeFullUser extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

interface RequestType extends Request {
    user?: userAccessType,
    encryptedToken?: string
}


class PersonalFileController {

    constructor() {

    }

    getPersonalThumbnail = async(req: RequestTypeFullUser, res: Response) => {


        if (!req.user) {

            return;
        }
    
        try {

            const s3Service = new S3Service();
            
            const user = req.user;
            const id = req.params.id;
    
            const decryptedThumbnail = await s3Service.getThumbnail(user, id);
        

            res.send(decryptedThumbnail);
    
        } catch (e) {

            console.log("\nGet Thumbnail Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }

    }

    getFullPersonalThumbnail = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const s3Service = new S3Service();

            const user = req.user;
            const fileID = req.params.id;

            await s3Service.getFullThumbnail(user, fileID, res);

        } catch (e) {
            
            console.log("\nGet Full Thumbnail Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    uploadPersonalFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
        
            return 
        }
    
        try {

            const s3Service = new S3Service();

            const user = req.user;
            const busboy = req.busboy;
            
            req.pipe(busboy);
    
            const file = await s3Service.uploadFile(user, busboy, req);
         
            res.send(file);
    
        } catch (e) {
            
            console.log("\nUpload File Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getPublicPersonalDownload = async(req: RequestType, res: Response) => {

        try {

            const ID = req.params.id;
            const tempToken = req.params.tempToken;
    
            const s3Service = new S3Service();

            await s3Service.getPublicDownload(ID, tempToken, res);
    
        } catch (e) {
    
            console.log("\nGet Public Download Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        } 
    }

    streamPersonalVideo = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {
    
            const user = req.user;
            const fileID = req.params.id;
            const headers = req.headers;

            const s3Service = new S3Service();

            await s3Service.streamVideo(user, fileID, headers, res, req);

        } catch (e) {

            console.log("\nStream Video Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }

    }

    downloadPersonalFile = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {

            const s3Service = new S3Service();
    
            const user = req.user;
            const fileID = req.params.id;

            await s3Service.downloadFile(user, fileID, res);
    
        } catch (e) {
            
            console.log("\nDownload File Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        } 
    }

    deletePersonalFile = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }
    
        try {

            const s3Service = new S3Service();
    
            const userID = req.user._id;
            const fileID = req.body.id;
    
            await s3Service.deleteFile(userID, fileID);
    
            res.send()
    
        } catch (e) {
            
            console.log("\nDelete File Error Personal File Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
}

export default PersonalFileController;