import { Request, Response } from "express";
import { UserInterface } from "../models/user";
import UserServiceGoogle from "../services/UserGoogle";
import { createLoginCookie } from "../cookies/createCookies";

const UserProviderGoogle = new UserServiceGoogle();

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

class UserGoogleController {
    
    constructor() {

    } 

    createGoogleStorageURL = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const googleData = req.body;

            const url = await UserProviderGoogle.createGoogleStorageURL(user, googleData);

            res.send(url);

        } catch (e) {
            const code = 500;
            console.log("Create Google Storage URL Error", e);
            res.status(code).send(e);
        }
    }

    addGoogleStorage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const code = req.body.code;
            const ipAddress = req.clientIp;

            const {accessToken, refreshToken} = await UserProviderGoogle.addGoogleStorage(user, code, ipAddress);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            const code = 500;
            console.log("Add Google Storage Error", e);
            res.status(code).send(e);
        }
    }

    removeGoogleStorage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user
            const ipAddress = req.clientIp;

            const {accessToken, refreshToken} = await UserProviderGoogle.removeGoogleStorage(user, ipAddress);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            const code = 500;
            console.log("Remove Google Storage Error", e);
            res.status(code).send(e);
        }
    }
}

export default UserGoogleController;