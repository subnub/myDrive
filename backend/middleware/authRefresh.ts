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

const removeOldTokens = async(userID: string, uuid: string | undefined, oldTime: number) => {

    try {

        const minusTime = oldTime - (1000 * 60 * 60);
        //const minusTime = oldTime - (1000);

        uuid = uuid ? uuid : "unknown";

        if (uuid === "unknown") return;

        await User.updateOne({_id: userID}, {$pull: {tokens: {uuid, time: {$lt: minusTime}}}})

    } catch (e) {
        console.log("cannot remove old tokens", e);
    }
}

const authRefresh = async(req: RequestType, res: Response, next: NextFunction) => {

    try {

        const refreshToken = req.cookies["refresh-token"];
        const currentUUID = req.headers.uuid as string;

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
                removeOldTokens(user._id, currentUUID, time);
                break;
            }
        }

        if (!tokenFound) {
            console.log("token not found", encryptedToken);
            console.log("token list", user.tokens);
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