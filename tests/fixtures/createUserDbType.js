const jwt = require("jsonwebtoken");
import mongoose from "../../dist/db/mongoose";
import User from "../../dist/models/user";
import env from "../../dist/enviroment/env";

const createUser = async(s3Enabled = false, googleDriveEnabled = false) => {

    env.key = "1234";
    env.password = "1234";
    process.env.KEY = "1234";
    process.env.PASSWORD = "1234";

    const userID = new mongoose.Types.ObjectId();
    const userData = {
        _id: userID,
        name: "Test User", 
        email: "test9@test.com", 
        password: "12345678",
        emailVerified: true,
        tokens: [],
        s3Enabled,
        googleDriveEnabled
    }

    let user = new User(userData);
    await user.save();

    await user.generateEncryptionKeys();

    await user.generateAuthToken("192.168.0.1");

    return {user, userData};
}

module.exports = createUser;