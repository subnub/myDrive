import jwt from "jsonwebtoken";
import User, {UserInterface} from "../models/user";
import env from "../enviroment/env";
import {Request, Response, NextFunction} from "express";

interface RequestType extends Request {
    user?: UserInterface,
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
    admin: boolean,
    botChecked: boolean,
    username: string,
}

const authFullUser = async(req: RequestType, res: Response, next: NextFunction) => {

    try {

        const accessToken = req.cookies["access-token"];

        if (!accessToken) throw new Error("No Access Token");

        const decoded = jwt.verify(accessToken, env.passwordAccess!) as jwtType;

        const user = decoded.user;

        if (!user) throw new Error("No User");
        if (!user.emailVerified && !env.disableEmailVerification) throw new Error("Email Not Verified")

        const fullUser = await User.findById(user._id);

        if (!fullUser) throw new Error("No User");

        req.user = fullUser;

        next();

    } catch (e) {

        if (e.message !== "No Access Token" && 
        e.message !== "No User" &&
        e.message !== "Email Not Verified") console.log("\nAuthorization Full User Middleware Error:", e.message);
        
        res.status(401).send("Error Authenticating");
    }
}

export default authFullUser;