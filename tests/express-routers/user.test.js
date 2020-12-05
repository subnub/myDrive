import User from "../../dist/models/user";
import mongoose from "../../dist/db/mongoose";
const conn = mongoose.connection;
const createUser = require("../fixtures/createUser");
import servers from "../../dist/server/server";
const request = require("supertest");
import env from "../../dist/enviroment/env";
const session = require("supertest-session");
const loginUser = require("../fixtures/loginUser");
const createUserNotEmailVerified = require("../fixtures/createUserNotEmailVerified");

const {server, serverHttps} = servers;

const app = server;

let user;
let userToken;
let userData;

const waitForDatabase = () => {

    return new Promise((resolve, reject) => {

        if (conn.readyState !== 1) {

            conn.once("open", () => {
                
                resolve();
    
            })

        } else {

            resolve();
        }
    
    })
}

beforeEach(async(done) => {

    await waitForDatabase();

    const {user: gotUser, userData: gotUserData} = await createUser();
    user = gotUser;
    userData = gotUserData;

    done();
    // if (conn.readyState === 0) {

    //     // user = await createUser();
    //     // userToken = user.tokens[0].token;
    //     const {user: gotUser, token: gotToken} = await createUser();
    //     user = gotUser;
    //     userToken = gotToken;

    //     done()

    // } else {
        
    //     // user = await createUser();
    //     // userToken = user.tokens[0].token;
    //     const {user: gotUser, token: gotToken} = await createUser();
    //     user = gotUser;
    //     userToken = gotToken;

    //     done();
    // }
})

afterEach(async(done) => {

    await User.deleteMany({});
    done();
})

test("When authorized, should return user, with no sensitive data", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const response = await appSession
    .get(`/user-service/user`)
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

    expect(response.body).toEqual({});
})

test("When giving credentials, should login user, and not return sensitive info", async() => {

    const response = await request(app)
    .post(`/user-service/login`)
    .send({
        email: user.email,
        password: "12345678"
    })
    .expect(200);

    expect(response.body.user.password).toEqual(undefined);
    expect(response.body.user.privateKey).toEqual(undefined);
    expect(response.body.user.publicKey).toEqual(undefined);
    expect(response.body.user.tokens).toEqual(undefined);
    expect(response.body.user.tempTokens).toEqual(undefined);
})

test("When giving wrong creditentials, should return 500 error", async() => {
  
    const response = await request(app)
    .post(`/user-service/login`)
    .send({
        email: user.email,
        password: "1454524"
    })
    .expect(500);

    expect(response.body).toEqual({});
})

test("When authorized should logout user", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    await appSession
    .post(`/user-service/logout`)
    .send()
    .expect(200);
})

test("When not authorized for logout, should return 401 error", async() => {

    const response = await request(app)
    .post(`/user-service/logout`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When authoized should logout all sessions of a user", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);
    
    await appSession
    .post(`/user-service/logout-all`)
    .send()
    .expect(200);
})

test("When not authorized for logout all, should return 401 error", async() => {

    const response = await request(app)
    .post(`/user-service/logout-all`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
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

    const appSession = session(app);

    await loginUser(appSession, userData);

    const oldPassword = "12345678";
    const newPassword = "987654321";

    await appSession
    .post(`/user-service/change-password`)
    .send({
        oldPassword, 
        newPassword
    })
    .expect(200);

    await request(app)
    .post(`/user-service/login`)
    .send({
        email: user.email,
        password: oldPassword
    })
    .expect(500);

    await request(app)
    .post(`/user-service/login`)
    .send({
        email: user.email,
        password: newPassword
    })
    .expect(200);
})

test("When giving wrong old password for change password, should return 500 error", async() => {

    const appSession = session(app);
    await loginUser(appSession, userData);
    
    const wrongOldPassword = "12342345";
    const newPassword = "987654321";

    await appSession
    .post(`/user-service/change-password`)
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

    expect(response.body).toEqual({});
})

test("When not email verified should not change password", async() => {

    const appSession = session(app);

    const {userData: userData2} = await createUserNotEmailVerified()
    await loginUser(appSession, userData2);

    const oldPassword = "12345678";
    const newPassword = "987654321";

    await appSession
    .post(`/user-service/change-password`)
    .send({
        oldPassword, 
        newPassword
    })
    .expect(401);
})

test("When not email verified, but email verification disabled, should change password", async() => {

    env.disableEmailVerification = true;

    const appSession = session(app);

    const {userData: userData2} = await createUserNotEmailVerified();
    await loginUser(appSession, userData2);

    const oldPassword = "12345678";
    const newPassword = "987654321";

    await appSession
    .post(`/user-service/change-password`)
    .send({
        oldPassword, 
        newPassword
    })
    .expect(200);

    await request(app)
    .post(`/user-service/login`)
    .send({
        email: userData2.email,
        password: oldPassword
    })
    .expect(500);

    await request(app)
    .post(`/user-service/login`)
    .send({
        email: userData2.email,
        password: newPassword
    })
    .expect(200);

    env.disableEmailVerification = undefined;
})

test("When not giving email, should not create user", async() => {

    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "",
        password: "12345678"
    })
    .expect(500);
})

test("When giving not a valid email, should not create user", async() => {

    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "imnotvalid",
        password: "12345678"
    })
    .expect(500);
})

test("When not giving long enouph password, should not create user", async() => {

    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "test12341@email.com",
        password: "123"
    })
    .expect(500);
})

test("When giving duplicate email, should not create user", async() => {
  
    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "test55@gmail.com",
        password: "12345678"
    })
    .expect(201);
    

    await request(app)
    .post(`/user-service/create`)
    .send({
        email: "test55@gmail.com",
        password: "12345678"
    })
    .expect(500);
})

test("When authenticated should get refresh token", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    await appSession.post("/user-service/get-token").send().expect(201);
})

test("When authenticated should get detailed user", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const response = await appSession.get("/user-service/user-detailed").send().expect(200);

    const responseData = response.body;
    const email = responseData.email;
    const username = responseData.username;
    const password = responseData.password;
    const emailVerified = responseData.emailVerified;
    const tokens = responseData.tokens;
    const publicKey = responseData.publicKey;
    const privateKey = responseData.privateKey;

    expect(email).toEqual(userData.email);
    expect(username).toEqual(userData.username);
    expect(password).toEqual(undefined);
    expect(emailVerified).toEqual(true);
    expect(tokens).toEqual(undefined);
    expect(publicKey).toEqual(undefined);
    expect(privateKey).toEqual(undefined)
})

test("When not authenticated should not get detailed user", async() => {

    await request(app).get("/user-service/user-detailed").send().expect(401);
})

test("When not email verified should not get detailed user", async() => {

    const appSession = session(app);
    
    const {userData: userData2} = await createUserNotEmailVerified();
    await loginUser(appSession, userData2);

    await request(app).get("/user-service/user-detailed").send().expect(401);
})

test("When not email verified but email verification disabled should get detailed user", async() => {

    env.disableEmailVerification = true;

    const appSession = session(app);
    
    const {userData: userData2} = await createUserNotEmailVerified();
    await loginUser(appSession, userData2);

    const response = await appSession.get("/user-service/user-detailed").send().expect(200);

    const responseData = response.body;
    const email = responseData.email;
    const username = responseData.username;
    const password = responseData.password;
    const emailVerified = responseData.emailVerified;
    const tokens = responseData.tokens;
    const publicKey = responseData.publicKey;
    const privateKey = responseData.privateKey;

    expect(email).toEqual(userData2.email);
    expect(username).toEqual(userData2.username);
    expect(password).toEqual(undefined);
    expect(emailVerified).toEqual(false);
    expect(tokens).toEqual(undefined);
    expect(publicKey).toEqual(undefined);
    expect(privateKey).toEqual(undefined)

    env.disableEmailVerification = undefined;
})

test("When giving existing email should send password reset email", async() => {

    await request(app).post("/user-service/send-password-reset").send({email: userData.email}).expect(200);
})

test("When giving not existing email should return 404", async() => {

    await request(app).post("/user-service/send-password-reset").send({email: "idontexist@void.com"}).expect(404);
})

test("When autheniticated should set users name", async() => {

    const appSession = session(app);
    await loginUser(appSession, userData);

    await appSession.patch("/user-service/add-name").send({name: "testname"}).expect(200);
})

test("When giving a not valid name length should not set users name", async() => {

    const appSession = session(app);
    await loginUser(appSession, userData);

    await appSession.patch("/user-service/add-name").send({name: ""}).expect(403);
})

test("When not giving name should not set users name", async() => {

    const appSession = session(app);
    await loginUser(appSession, userData);

    await appSession.patch("/user-service/add-name").send().expect(403);
})

