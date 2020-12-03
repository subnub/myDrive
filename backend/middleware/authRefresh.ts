import jwt from "jsonwebtoken";
import User, {UserInterface} from "../models/user";
import env from "../enviroment/env";
import {Request, Response, NextFunction} from "express";
import { ObjectID } from "mongodb";

interface RequestType extends Request {
    user?: UserInterface,
    token?: string,
    encryptedToken?: string,
}

type jwtType = {
    iv: Buffer,
    _id: string,
    time: number
}

const removeOldTokens = async(userID: string, ipAddress: string | undefined, oldTime: number) => {

    try {

        const minusTime = oldTime - (1000 * 60 * 60);

        ipAddress = ipAddress ? ipAddress : "";

        if (ipAddress === "") return;

        await User.updateOne({_id: userID}, {$pull: {tokens: {ipAddress, time: {$lt: minusTime}}}})

    } catch (e) {
        console.log("cannot remove old tokens", e);
    }
}

const authRefresh = async(req: RequestType, res: Response, next: NextFunction) => {

    try {

        const refreshToken = req.cookies["refresh-token"];

        if (!refreshToken) throw new Error("No Refresh Token");

        const decoded = jwt.verify(refreshToken, env.passwordRefresh!) as jwtType;  

        const time = decoded.time;
        
        const user = await User.findById(new ObjectID(decoded._id));

        if (!user) throw new Error("No User");

        const encrpytionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(refreshToken, encrpytionKey, decoded.iv);

        let tokenFound = false;
        
        for (let i = 0; i < user.tokens.length; i++) {

            const currentEncryptedToken = user.tokens[i].token;

            if (currentEncryptedToken === encryptedToken) {

                tokenFound = true;
                removeOldTokens(user._id, req.clientIp, time);
                break;
            }
        }

        if (!tokenFound) throw new Error("Refresh Token Not Found");

        req.user = user;

        next();

    } catch (e) {

        if (e.message !== "No Refresh Token" && 
        e.message !== "No User" &&
        e.message !== "Refresh Token Not Found") console.log("\nAuthorization Refresh Middleware Error:", e.message);

        res.status(401).send("Error Refreshing Token");
    }
}

export default authRefresh;