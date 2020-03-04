const User = require("../../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const NotFoundError = require("../../utils/NotFoundError");
const InternalServerError = require("../../utils/InternalServerError");
const NotAuthorizedError = require("../../utils/NotAuthorizedError");

const UserService = function() {

    this.login = async(userData) => {

        const email = userData.email;
        const password = userData.password; 

        const user = await User.findByCreds(email, password);

        const token = await user.generateAuthToken();

        if (!user || !token) throw new NotFoundError("Login User Not Found Error");

        return {user, token}
    }

    this.logout = async(user, userToken) => {

        user.tokens = user.tokens.filter((token) => {
            return token.token !== userToken;
        })

        await user.save();
    }

    this.logoutAll = async(user) => {
    
        user.tokens = []
        user.tempTokens = [];

        await user.save();
    }

    this.create = async(userData) => {

        console.log("Create");

        const user = new User(userData);
        await user.save();

        await user.generateEncryptionKeys();

        const token = await user.generateAuthToken();

        if (!user || !token) throw new InternalServerError("Could Not Create New User Error");

        return {user, token}
    }

    this.changePassword = async(user, oldPassword, newPassword) => {

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) throw new NotAuthorizedError("Change Passwords Do Not Match Error");

        const encryptionKey = user.getEncryptionKey();
        
        user.password = newPassword;

        user.tokens = [];
        user.tempTokens = [];
        
        await user.save();
        await user.changeEncryptionKey(encryptionKey);
        
        const newToken = await user.generateAuthToken();

        return newToken;
    }
}

module.exports = UserService;