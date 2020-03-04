const jwt = require("jsonwebtoken");
const mongoose = require("../../src/db/mongoose");
const User = require("../../src/models/user");
const env = require("../../src/enviroment/env");

const createUser = async() => {

    env.key = "1234";
    env.password = "1234";
    process.env.KEY = "1234";
    process.env.PASSWORD = "1234";

    const userID = new mongoose.Types.ObjectId();
    const userData = {
        _id: userID,
        name: "Test User", 
        email: "test2@test.com", 
        password: "12345678",
    }

    let user = new User(userData);
    await user.save();

    await user.generateEncryptionKeys();

    const token = await user.generateAuthToken();

    return {user, token};
}

module.exports = createUser;