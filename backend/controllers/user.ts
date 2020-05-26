
import env from "../enviroment/env";
import UserService from "../services/UserService";
import { Request, Response } from "express";
import { UserInterface } from "../models/user";
const UserProvider = new UserService();

interface RequestType extends Request {
    user?: UserInterface,
    encryptedToken?: string
}

class UserController {

    constructor() {

    }

    getUser = async(req: RequestType, res: Response) => {
        
        try {

            const user = req.user!;
            user.tokens = [];
            user.tempTokens = [];
            user.password = '';
            user.privateKey = undefined;
            user.publicKey = undefined;

            res.send(user)
    
        } catch (e) {

            res.status(500).send(e);
        }
    }

    login = async(req: RequestType, res: Response) => {

        try {

            const body = req.body;

            const {user, token} = await UserProvider.login(body);

            user.tokens = [];
            user.tempTokens = [];
            user.password = '';
            user.privateKey = undefined;
            user.publicKey = undefined;
    
            res.status(200).send({user, token});
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send(e);
        }
    }

    logout = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }
        
        try {
            
            const user = req.user;
            const token = req.encryptedToken;

            await UserProvider.logout(user, token);
    
            res.send();
    
        } catch (e) {
    
            res.status(500).send(e);
        }
    }

    logoutAll = async(req: RequestType, res: Response) => {

        try {

            const user = req.user;

            await UserProvider.logoutAll(user!);
    
            res.send();
    
        } catch (e) {
    
            res.status(500).send(e);
        }
    }

    createUser = async(req: RequestType, res: Response) => {

        if (env.createAcctBlocked) {

            return await res.status(401).send()
        }
        
        try {
    
            const {user, token} = await UserProvider.create(req.body);

            user.tokens = [];
            user.tempTokens = []
            user.password = '';
            user.privateKey = undefined;
            user.publicKey = undefined;
    
            res.status(201).send({user, token})
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send(e);
        }
    }

    changePassword = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }
    
        try {
            
            const user = req.user;
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;

            const newToken = await UserProvider.changePassword(user, oldPassword, newPassword);
            
            res.send(newToken);
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send(e);
        }
    }
}

export default UserController;