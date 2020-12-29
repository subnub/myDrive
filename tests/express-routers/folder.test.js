import User from "../../dist/models/user";
import mongoose from "../../dist/db/mongoose";
const conn = mongoose.connection;
const createUser = require("../fixtures/createUser");
const createUser2 = require("../fixtures/createUser2");
const createFile = require("../fixtures/createFile");
const crypto = require("crypto");
const path = require("path");
import env from "../../dist/enviroment/env";
const request = require("supertest");
const jwt = require("jsonwebtoken");
const ObjectID = require('mongodb').ObjectID
import servers from "../../dist/server/server";
import Folder from "../../dist/models/folder";
const temp = require("temp").track();
const binaryPhraser = require("superagent-binary-parser");
const session = require("supertest-session");
const loginUser = require("../fixtures/loginUser");
const createUserNotEmailVerified = require("../fixtures/createUserNotEmailVerified");


const {server, serverHttps} = servers;

const app = server;

let user;
let user2;
let userData;
let userData2;
let file;
let folder;

process.env.KEY = "1234";
env.key = "1234";

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
        
    const {user: gotUser2, userData: gotUserData2} = await createUser2();
    user2 = gotUser2;
    userData2 = gotUserData2;

    const folderData = {
        name: "bunny",
        parent: "/",
        owner: user._id,
        parentList: ["/"]
    }

    folder = new Folder(folderData);
    await folder.save();

    done();

    // if (conn.readyState === 0) {

    //     conn.on("open", async() => {

    //         // user = await createUser();
    //         // userToken = user.tokens[0].token;
            
    //         // user2 = await createUser2();
    //         // userToken2 = user2.tokens[0].token;

    //         const {user: gotUser, token: gotToken} = await createUser();
    //         user = gotUser;
    //         userToken = gotToken;
                
    //         const {user: gotUser2, token: gotToken2} = await createUser2();
    //         user2 = gotUser2;
    //         userToken2 = gotToken2;

    //         const folderData = {
    //             name: "bunny",
    //             parent: "/",
    //             owner: user._id,
    //             parentList: ["/"]
    //         }
    
    //         folder = new Folder(folderData);
    //         await folder.save();

    //         done();

    //     })

    // } else {

    //     // user = await createUser();
    //     // userToken = user.tokens[0].token;
        
    //     // user2 = await createUser2();
    //     // userToken2 = user2.tokens[0].token;
    //     const {user: gotUser, token: gotToken} = await createUser();
    //     user = gotUser;
    //     userToken = gotToken;
            
    //     const {user: gotUser2, token: gotToken2} = await createUser2();
    //     user2 = gotUser2;
    //     userToken2 = gotToken2;


    //     const folderData = {
    //         name: "bunny",
    //         parent: "/",
    //         owner: user._id,
    //         parentList: ["/"]
    //     }

    //     folder = new Folder(folderData);
    //     await folder.save();

    //     done();


    // }
})

afterEach(async(done) => {

    let bucket = new mongoose.mongo.GridFSBucket(conn.db);
            
    await User.deleteMany({});
    await Folder.deleteMany({});

    const allFiles = await conn.db.collection("fs.files").find({}).toArray();

    for (let i = 0; i < allFiles.length; i++) {

        const currentFileID = allFiles[i]._id;
        await bucket.delete(ObjectID(currentFileID));
    }
   
    done();
})

test("When giving folderID, should return folder info", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderID = folder._id;

    await appSession
    .get(`/folder-service/info/${folderID}`)
    .send()
    .expect(200);
})

test("When not authorized for folder info, should return 401 error", async() => {

    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/info/${folderID}`)
    .send()
    .expect(401);
})

test("When giving wrong authorization for folder info, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const folderID = folder._id;

    await appSession
    .get(`/folder-service/info/${folderID}`)
    .send()
    .expect(404);
})

test("When giving folderID, should return subfolder list", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderID = folder._id;

    await appSession
    .get(`/folder-service/subfolder-list?id=${folderID}`)
    .send()
    .expect(200);
})

test("When giving no folderID for subfolder list, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    await appSession
    .get(`/folder-service/subfolder-list`)
    .send()
    .expect(404);
})

test("When giving no authorization for subfolder list, should return 401 error", async() => {

    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/subfolder-list?id=${folderID}`)
    .send()
    .expect(401);
})

test("When giving wrong authorization for subfolder list, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const folderID = folder._id;

    await appSession
    .get(`/folder-service/subfolder-list?id=${folderID}`)
    .send()
    .expect(404);

})

test("When giving default query, should return folder list", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const query = {}

    await appSession
    .get(`/folder-service/list?query=${query}`)
    .send()
    .expect(200);
})

test("When giving no authorization for folder list, should return 401 error", async() => {

    const query = {}

    await request(app)
    .get(`/folder-service/list?query=${query}`)
    .send()
    .expect(401);
})

test("When giving ID and parent, should move folder", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderData = {
        name: "bunny",
        parent: "/",
        owner: user._id,
        parentList: ["/"]
    }

    const folder2 = new Folder(folderData);
    await folder2.save();
    const parentID = folder2._id;

    const folderID = folder._id;

    await appSession
    .patch(`/folder-service/move`)
    .send({
        id: folderID,
        parent: parentID
    })
    .expect(200);
})

test("When giving a folder id that does not exist for move folder, should return 500 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderData = {
        name: "bunny",
        parent: "/",
        owner: user._id,
        parentList: ["/"]
    }

    const folder2 = new Folder(folderData);
    await folder2.save();
    const parentID = folder2._id;

    await appSession
    .patch(`/folder-service/move`)
    .send({
        id: "1234",
        parent: parentID
    })
    .expect(500);

})

test("When giving parent id that does not exist for move folder, should return 500 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderID = folder._id;

    await appSession
    .patch(`/folder-service/move`)
    .send({
        id: folderID,
        parent: "1234"
    })
    .expect(500);
})

test("When giving folder id and title, should rename folder", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const folderID = folder._id;
    const title = "new name";

    await appSession
    .patch(`/folder-service/rename`)
    .send({
        id: folderID,
        title
    })
    .expect(200);
})

test("When giving not authorization for rename folder, should return 401 error", async() => {

    const folderID = folder._id;
    const title = "new name";

    await request(app)
    .patch(`/folder-service/rename`)
    .send({
        id: folderID,
        title
    })
    .expect(401);
})

test("When giving id for folder that does not exist for rename, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const wrongFolderID = "123456789012";
    const title = "new name";

    await appSession
    .patch(`/folder-service/rename`)
    .send({
        id: wrongFolderID,
        title
    })
    .expect(404);

})