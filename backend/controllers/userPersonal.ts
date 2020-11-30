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
            const ipAddress = req.clientIp;

            const {accessToken, refreshToken} = await UserProviderPersonal.addS3Storage(user, s3Data, ipAddress);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            const code = 500;
            console.log("Add S3 Storage Error", e);
            res.status(code).send(e);
        }
    }

    removeS3Storage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const ipAddress = req.clientIp;

            const {accessToken, refreshToken} = await UserProviderPersonal.removeS3Storage(user, ipAddress);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            const code = 500;
            console.log("Remove S3 Storage Error", e);
            res.status(code).send(e);
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
            const code = 500;
            console.log("Remove S3 Storage Error", e);
            res.status(code).send(e);
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

            const code = 500;

            console.log("Download personal file list error", e);
            res.status(code).send(e);
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
            const code = 500;
            console.log("Upload personal file list error", e);
            res.status(code).send(e);
        }
    }
}

export default UserPersonalController;