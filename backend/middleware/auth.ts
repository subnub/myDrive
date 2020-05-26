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
    _id: string,
}

const auth = async(req: RequestType, res: Response, next: NextFunction) => {

    try {

        const token = req.header("Authorization")!.replace("Bearer ", "");

        const decoded = jwt.verify(token, env.password!) as jwtType;

        const iv = decoded.iv;
        
        const user = await User.findOne({_id: decoded._id}) as UserInterface;
        const encrpytionKey = user.getEncryptionKey();
    
        const encryptedToken = user.encryptToken(token, encrpytionKey, iv);

        let tokenFound = false;
        for (let i = 0; i < user.tokens.length; i++) {

            const currentToken = user.tokens[i].token;

            if (currentToken === encryptedToken) {
                tokenFound = true;
                break;
            }
        }

        if (!user || !tokenFound) {

            throw new Error("User not found")

        } else {

            req.token = token; 
            req.encryptedToken = encryptedToken
            req.user = user;
            next();
        }

    } catch (e) {
        console.log(e);
        res.status(401).send({error: "Error Authenticating"})
    }
}

export default auth;