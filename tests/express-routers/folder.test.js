const User = require("../../src/models/user");
const mongoose = require("../../src/db/mongoose");
const conn = mongoose.connection;
const createUser = require("../fixtures/createUser");
const createUser2 = require("../fixtures/createUser2");
const createFile = require("../fixtures/createFile");
const crypto = require("crypto");
const path = require("path");
const env = require("../../src/enviroment/env");
const createThumbnail = require("../../src/services/FileService/utils/createThumbnail");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const ObjectID = require('mongodb').ObjectID
const app = require("../../server/server");
const Folder = require("../../src/models/folder");
const temp = require("temp").track();
const binaryPhraser = require("superagent-binary-parser");

let user;
let userToken;
let user2;
let userToken2;
let file;
let folder;

process.env.KEY = "1234";
env.key = "1234";


beforeEach(async(done) => {

    if (conn.readyState === 0) {

        conn.on("open", async() => {

            // user = await createUser();
            // userToken = user.tokens[0].token;
            
            // user2 = await createUser2();
            // userToken2 = user2.tokens[0].token;

            const {user: gotUser, token: gotToken} = await createUser();
            user = gotUser;
            userToken = gotToken;
                
            const {user: gotUser2, token: gotToken2} = await createUser2();
            user2 = gotUser2;
            userToken2 = gotToken2;

            const folderData = {
                name: "bunny",
                parent: "/",
                owner: user._id,
                parentList: ["/"]
            }
    
            folder = new Folder(folderData);
            await folder.save();

            done();

        })

    } else {

        // user = await createUser();
        // userToken = user.tokens[0].token;
        
        // user2 = await createUser2();
        // userToken2 = user2.tokens[0].token;
        const {user: gotUser, token: gotToken} = await createUser();
        user = gotUser;
        userToken = gotToken;
            
        const {user: gotUser2, token: gotToken2} = await createUser2();
        user2 = gotUser2;
        userToken2 = gotToken2;


        const folderData = {
            name: "bunny",
            parent: "/",
            owner: user._id,
            parentList: ["/"]
        }

        folder = new Folder(folderData);
        await folder.save();

        done();


    }
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

    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/info/${folderID}`)
    .set("Authorization", `Bearer ${userToken}`)
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

    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/info/${folderID}`)
    .set("Authorization", `Bearer ${userToken2}`)
    .send()
    .expect(404);
})

test("When giving folderID, should return subfolder list", async() => {

    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/subfolder-list?id=${folderID}`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);
})

test("When giving no folderID for subfolder list, should return 404 error", async() => {

    await request(app)
    .get(`/folder-service/subfolder-list`)
    .set("Authorization", `Bearer ${userToken}`)
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


    const folderID = folder._id;

    await request(app)
    .get(`/folder-service/subfolder-list?id=${folderID}`)
    .set("Authorization", `Bearer ${userToken2}`)
    .send()
    .expect(404);

})

test("When giving default query, should return folder list", async() => {

    const query = {}

    await request(app)
    .get(`/folder-service/list?query=${query}`)
    .set("Authorization", `Bearer ${userToken}`)
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

    await request(app)
    .patch(`/folder-service/move`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: folderID,
        parent: parentID
    })
    .expect(200);
})

test("When giving a folder id that does not exist for move folder, should return 500 error", async() => {

    const folderData = {
        name: "bunny",
        parent: "/",
        owner: user._id,
        parentList: ["/"]
    }

    const folder2 = new Folder(folderData);
    await folder2.save();
    const parentID = folder2._id;

    await request(app)
    .patch(`/folder-service/move`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: "1234",
        parent: parentID
    })
    .expect(500);

})

test("When giving parent id that does not exist for move folder, should return 500 error", async() => {

    const folderID = folder._id;

    await request(app)
    .patch(`/folder-service/move`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: folderID,
        parent: "1234"
    })
    .expect(500);
})

test("When giving folder id and title, should rename folder", async() => {

    const folderID = folder._id;
    const title = "new name";

    await request(app)
    .patch(`/folder-service/rename`)
    .set("Authorization", `Bearer ${userToken}`)
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


    const wrongFolderID = "123456789012";
    const title = "new name";

    await request(app)
    .patch(`/folder-service/rename`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: wrongFolderID,
        title
    })
    .expect(404);

})