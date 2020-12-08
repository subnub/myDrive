import jwt from "jsonwebtoken";
import User, {UserInterface} from "../models/user";
import env from "../enviroment/env";
import {Request, Response, NextFunction} from "express";
import userUpdateCheck from "../utils/userUpdateCheck";

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

        let user = decoded.user;

        if (!user) throw new Error("No User");

        if (!user.emailVerified && !env.disableEmailVerification) {
            const currentUUID = req.headers.uuid as string;
            user = await userUpdateCheck(res, user._id, currentUUID);
        }

        req.user = user;

        next();

    } catch (e) {

        if (e.message !== "No Access Token" && 
        e.message !== "No User") console.log("\nAuthorization No Email Verification Middleware Error:", e.message);

        return res.status(401).send("Error Authenticating");
    }
}

export default auth;