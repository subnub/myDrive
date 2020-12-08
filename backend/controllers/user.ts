
import env from "../enviroment/env";
import UserService from "../services/UserService";
import { Request, Response } from "express";
import { UserInterface } from "../models/user";
import { createLoginCookie, createLogoutCookie } from "../cookies/createCookies";
import NotFoundError from "../utils/NotFoundError";
import InternalServerError from "../utils/InternalServerError";

const UserProvider = new UserService();

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    admin: boolean,
    botChecked: boolean,
    username: string,
}

interface RequestTypeRefresh extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

interface RequestType extends Request {
    user?: userAccessType,
    encryptedToken?: string
}

class UserController {

    constructor() {

    }

    getUser = async(req: RequestType, res: Response) => {
        
        try {

            const user = req.user!;

            res.send(user)
    
        } catch (e) {

            console.log("\nGet User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    login = async(req: RequestType, res: Response) => {

        try {

            const body = req.body;
            
            const currentUUID = req.headers.uuid as string;

            const {user, accessToken, refreshToken} = await UserProvider.login(body, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.status(200).send({user});
    
        } catch (e) {
    
            console.log("\nLogin User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getToken = async(req: RequestTypeRefresh, res: Response) => {

        try {

            const user = req.user;

            if (!user) throw new NotFoundError("User Not Found");

            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await user.generateAuthToken(currentUUID);

            if (!accessToken || !refreshToken) throw new InternalServerError("User/Access/Refresh Token Missing");

            createLoginCookie(res, accessToken, refreshToken);

            res.status(201).send();

        } catch (e) {

            console.log("\nGet Refresh Token User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    logout = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }
        
        try {
            
            const userID = req.user._id;
            const refreshToken = req.cookies["refresh-token"];

            await UserProvider.logout(userID, refreshToken);

            createLogoutCookie(res);
    
            res.send();
    
        } catch (e) {
    
            console.log("\nLogout User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            createLogoutCookie(res);
            res.status(code).send();
        }
    }

    logoutAll = async(req: RequestType, res: Response) => {

        if (!req.user) return;

        try {

            const userID = req.user._id;

            await UserProvider.logoutAll(userID);

            createLogoutCookie(res);
    
            res.send();
    
        } catch (e) {
    
            console.log("\nLogout All User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    createUser = async(req: RequestType, res: Response) => {

        if (env.createAcctBlocked) {

            return await res.status(401).send()
        }
        
        try {
    
            const currentUUID = req.headers.uuid as string;

            const {user, accessToken, refreshToken} = await UserProvider.create(req.body, currentUUID);

            createLoginCookie(res, accessToken, refreshToken);
    
            res.status(201).send({user})
    
        } catch (e) {
            
            console.log("\nCreate User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    changePassword = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }
    
        try {
        
            const userID = req.user._id;
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            const oldRefreshToken = req.cookies["refresh-token"];
            
            const currentUUID = req.headers.uuid as string;

            const {accessToken, refreshToken} = await UserProvider.changePassword(userID, oldPassword, newPassword, oldRefreshToken, currentUUID);
            
            createLoginCookie(res, accessToken, refreshToken);

            res.send();
    
        } catch (e) {
    
            console.log("\nChange Password User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    refreshStorageSize = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;

            await UserProvider.refreshStorageSize(userID);

            res.send();

        } catch (e) {

            console.log("\nRefresh Storage Size User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    getUserDetailed = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;

            const userDetailed = await UserProvider.getUserDetailed(userID);

            res.send(userDetailed);

        } catch (e) {

            console.log("\nGet User Detailed User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    verifyEmail = async(req: RequestType, res: Response) => {

        try {

            const verifyToken = req.body.emailToken;
            
            const currentUUID = req.headers.uuid as string;

            const user = await UserProvider.verifyEmail(verifyToken);

            const {accessToken, refreshToken} = await user.generateAuthToken(currentUUID);

            createLoginCookie(res, accessToken, refreshToken);

            res.send();

        } catch (e) {

            console.log("\nVerify Email User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    resendVerifyEmail = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;

            await UserProvider.resendVerifyEmail(userID);

            res.send();

        } catch (e) {

            console.log("\nResend Email User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    sendPasswordReset = async(req: RequestType, res: Response) => {

        try {

            const email = req.body.email;

            await UserProvider.sendPasswordReset(email);

            res.send();

        } catch (e) {

            console.log("\nSend Password Reset Email User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }

    resetPassword = async(req: RequestType, res: Response) => {

        try {

            const verifyToken = req.body.passwordToken;
            const newPassword = req.body.password;

            await UserProvider.resetPassword(newPassword, verifyToken);

            res.send();

        } catch (e) {

            console.log("\nReset Password User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
    
    addName = async(req: RequestType, res: Response) => {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;
            const name = req.body.name;

            await UserProvider.addName(userID, name);

            res.send();

        } catch (e) {
            
            console.log("\nAdd Name User Route Error:", e.message);
            const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
            res.status(code).send();
        }
    }
}

export default UserController;