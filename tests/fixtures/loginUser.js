import mongoose from "../../dist/db/mongoose";
import User from "../../dist/models/user";
import env from "../../dist/enviroment/env";
const request = require("supertest");

const loginUser = async(appSession, userData) => {

    const response = await appSession.post("/user-service/login")
        .send({email: userData.email, password: userData.password}).expect(200);

    return response.body;
}

module.exports = loginUser;