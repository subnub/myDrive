const env = require("../enviroment/env");
const UserService = require("../services/UserService")
const UserProvider = new UserService();

class UserController {

    constructor() {

    }

    async getUser(req, res) {
        
        try {

            const user = req.user;
            user.tokens = undefined;
            user.tempTokens = undefined;
            user.password = undefined;
            user.privateKey = undefined;
            user.publicKey = undefined;

            res.send(user)
    
        } catch (e) {

            res.status(500).send(e);
        }
    }

    async login(req, res) {

        try {

            const body = req.body;

            const {user, token} = await UserProvider.login(body);

            user.tokens = undefined;
            user.tempTokens = undefined;
            user.password = undefined;
            user.privateKey = undefined;
            user.publicKey = undefined;
    
            res.status(200).send({user, token});
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send(e);
        }
    }

    async logout(req, res) {

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

    async logoutAll(req, res) {

        try {

            const user = req.user;

            await UserProvider.logoutAll(user);
    
            res.send();
    
        } catch (e) {
    
            res.status(500).send(e);
        }
    }

    async createUser(req, res) {

        if (env.createAcctBlocked) {

            return await res.status(401).send()
        }
        
        try {
    
            const {user, token} = await UserProvider.create(req.body);

            user.tokens = undefined;
            user.tempTokens = undefined;
            user.password = undefined;
            user.privateKey = undefined;
            user.publicKey = undefined;
    
            res.status(201).send({user, token})
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send(e);
        }
    }

    async changePassword(req, res) {

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

module.exports = UserController;