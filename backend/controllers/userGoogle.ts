import { Request, Response } from "express";
import { UserInterface } from "../models/user";
import UserServiceGoogle from "../services/UserGoogle";
import { createLoginCookie } from "../cookies/createCookies";

const UserProviderGoogle = new UserServiceGoogle();

interface RequestTypeFullUser extends Request {
    user?: UserInterface,
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
            
            console.log("\nCreate Storage URL Error Google User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    addGoogleStorage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const code = req.body.code;
            
            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await UserProviderGoogle.addGoogleStorage(user, code, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            
            console.log("\nAdd Google Storage Error Google User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    removeGoogleStorage = async(req: RequestTypeFullUser, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user

            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await UserProviderGoogle.removeGoogleStorage(user, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {
            
            console.log("\nRemove Google Storage Error Google User Route:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
}

export default UserGoogleController;