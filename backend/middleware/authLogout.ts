import jwt from "jsonwebtoken";
import env from "../enviroment/env";
import {Request, Response, NextFunction} from "express";
import { createLogoutCookie } from "../cookies/createCookies";

interface RequestType extends Request {
    user?: userAccessType,
    token?: string,
    encryptedToken?: string,
}

type jwtType = {
    iv: Buffer,
    user: userAccessType
}

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    botChecked: boolean,
}

const auth = async(req: RequestType, res: Response, next: NextFunction) => {

    try {

        const accessToken = req.cookies["access-token"];

        if (!accessToken) throw new Error("No Access Token");

        const decoded = jwt.verify(accessToken, env.passwordAccess!) as jwtType;

        const user = decoded.user;

        if (!user) throw new Error("No User");

        req.user = user;

        next();

    } catch (e) {

        if (e.message !== "No Access Token" && 
        e.message !== "No User") console.log("\nAuthorization Logout Middleware Error:", e.message);

        createLogoutCookie(res);
        return res.status(401).send("Error Authenticating");
    }
}

export default auth;