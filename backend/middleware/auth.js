const jwt = require("jsonwebtoken");
const User = require("../models/user");
const env = require("../enviroment/env");

const auth = async(req, res, next) => {

    try {

        const token = req.header("Authorization").replace("Bearer ", "");

        const decoded = await jwt.verify(token, env.password);

        const iv = decoded.iv;

        const user = await User.findOne({_id: decoded._id});
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

module.exports = auth;