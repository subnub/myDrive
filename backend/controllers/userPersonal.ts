import { Request, Response } from "express";
import { UserInterface } from "../models/user";
import UserServicePersonal from "../services/UserPersonalService";
import { createLoginCookie } from "../cookies/createCookies";

const UserProviderPersonal = new UserServicePersonal()

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

class UserPersonalController {
    
    constructor() {

    }

    addS3Storage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const s3Data = req.body;
            
            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await UserProviderPersonal.addS3Storage(user, s3Data, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            
            console.log("\nAdd S3 Storage Error Personal User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    removeS3Storage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await UserProviderPersonal.removeS3Storage(user, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            
            console.log("\nRemove S3 Storage Error Personal User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    removeS3Metadata = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;

            await UserProviderPersonal.removeS3Metadata(user);

            res.send();

        } catch (e) {
            
            console.log("\nRemove S3 Metadata Error Personal User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    downloadPersonalFileList = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }

        try {

            const user = req.user;

            res.set('Content-Type', 'application/json');
            res.setHeader('Content-disposition', 'attachment; filename= personal-data-list.json');

            const personalFileList = await UserProviderPersonal.downloadPersonalFileList(user);

            res.send(personalFileList);

        } catch (e) {

            console.log("\nDownload S3 Metadata Error Personal User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    uploadPersonalFileList = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }

        try {

            const user = req.user;
            const fileList = req.body;

            await UserProviderPersonal.uploadPersonalFileList(user, fileList);

            res.send();

        } catch (e) {
            
            console.log("\nUpload S3 Metadata Error Personal User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
}

export default UserPersonalController;