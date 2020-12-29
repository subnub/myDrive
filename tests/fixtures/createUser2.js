const jwt = require("jsonwebtoken");
import mongoose from "../../dist/db/mongoose";
import User from "../../dist/models/user";
import env from "../../dist/enviroment/env";

const createUser2 = async() => {

    env.key = "1234";
    env.password = "1234";
    process.env.KEY = "1234";
    process.env.PASSWORD = "1234";

    const userID = new mongoose.Types.ObjectId();
    const userData = {
        _id: userID,
        name: "Test User", 
        email: "test3@test.com", 
        password: "123456789",
        emailVerified: true,
    }

    let user = new User(userData);
    await user.save();

    await user.generateEncryptionKeys();

    const token = await user.generateAuthToken();

    user.emailVerified = true;

    await user.save();

    return {user, userData};
}

module.exports = createUser2;