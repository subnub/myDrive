const User = require("../../src/models/user");
const mongoose = require("../../src/db/mongoose");
const conn = mongoose.connection;
const createUser = require("../fixtures/createUser");
const app = require("../../server/server");
const request = require("supertest");
const env = require("../../src/enviroment/env")

let user;
let userToken;

beforeEach(async(done) => {

    if (conn.readyState === 0) {

        // user = await createUser();
        // userToken = user.tokens[0].token;
        const {user: gotUser, token: gotToken} = await createUser();
        user = gotUser;
        userToken = gotToken;

        done()

    } else {
        
        // user = await createUser();
        // userToken = user.tokens[0].token;
        const {user: gotUser, token: gotToken} = await createUser();
        user = gotUser;
        userToken = gotToken;

        done();
    }
})

afterEach(async(done) => {

    await User.deleteMany({});
    done();
})

test("When authorized, should return user, with no sensitive data", async() => {

    const response = await request(app)
    .get(`/user-service/user`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);

    expect(response.body.password).toEqual(undefined);
    expect(response.body.privateKey).toEqual(undefined);
    expect(response.body.publicKey).toEqual(undefined);
    expect(response.body.tokens).toEqual(undefined);
    expect(response.body.tempTokens).toEqual(undefined);
    expect(response.body.email).not.toEqual(undefined);
})

test("When not authorized should return 401 for user", async() => {

    const response = await request(app)
    .get(`/user-service/user`)
    .send()
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving credentials, should login user, and not return sensitive info", async() => {

    const response = await request(app)
    .post(`/user-service/login`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        email: user.email,
        password: "12345678"
    })
    .expect(200);

    expect(response.body.password).toEqual(undefined);
    expect(response.body.privateKey).toEqual(undefined);
    expect(response.body.publicKey).toEqual(undefined);
    expect(response.body.tokens).toEqual(undefined);
    expect(response.body.tempTokens).toEqual(undefined);
})

test("When giving wrong creditentials, should return 500 error", async() => {
  
    const response = await request(app)
    .post(`/user-service/login`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        email: user.email,
        password: "1454524"
    })
    .expect(500);

    expect(response.body).toEqual({});
})

test("When authorized should logout user", async() => {

    await request(app)
    .post(`/user-service/logout`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);
})

test("When not authorized for logout, should return 401 error", async() => {

    const response = await request(app)
    .post(`/user-service/logout`)
    .send()
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When authoized should logout all sessions of a user", async() => {

    await request(app)
    .post(`/user-service/logout-all`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);
})

test("When not authorized for logout all, should return 401 error", async() => {

    const response = await request(app)
    .post(`/user-service/logout-all`)
    .send()
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving user data, should create account without returning sensitive data", async() => {

    const response = await request(app)
    .post(`/user-service/create`)
    .send({
        email: "test55@gmail.com",
        password: "12345678"
    })
    .expect(201);

    expect(response.body.password).toEqual(undefined);
    expect(response.body.privateKey).toEqual(undefined);
    expect(response.body.publicKey).toEqual(undefined);
    expect(response.body.tokens).toEqual(undefined);
    expect(response.body.tempTokens).toEqual(undefined);
})

test("When env variable is set to block accounts, should return 401 error", async() => {

    env.createAcctBlocked = true;

    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "test55@gmail.com",
        password: "12345678"
    })
    .expect(401);

    env.createAcctBlocked = false;
})

test("When giving old password, and new password, should change password", async() => {

    const oldPassword = "12345678";
    const newPassword = "987654321";

    await request(app)
    .post(`/user-service/change-password`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        oldPassword, 
        newPassword
    })
    .expect(200);
})

test("When giving wrong old password for change password, should return 500 error", async() => {

    const wrongOldPassword = "12342345";
    const newPassword = "987654321";

    await request(app)
    .post(`/user-service/change-password`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        wrongOldPassword, 
        newPassword
    })
    .expect(500);
})

test("When not authorized for change password, should return 401 error", async() => {

    const oldPassword = "12345678";
    const newPassword = "987654321";

    const response = await request(app)
    .post(`/user-service/change-password`)
    .send({
        oldPassword, 
        newPassword
    })
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})