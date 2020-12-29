import User from "../../dist/models/user";
import mongoose from "../../dist/db/mongoose";
const conn = mongoose.connection;
const createUser = require("../fixtures/createUser");
const createUser2 = require("../fixtures/createUser2");
const createFile = require("../fixtures/createFile");
const crypto = require("crypto");
const path = require("path");
import env from "../../dist/enviroment/env";
import createThumbnail from "../../dist/services/ChunkService/utils/createThumbailAny";
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
const Thumbnail = require("../../dist/models/thumbnail");

const {server, serverHttps} = servers;

const app = server;

let user;
let user2;
let userData;
let userData2;
let file;

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

    const initVect = crypto.randomBytes(16);
            
    const {user: gotUser, userData: gotUserData} = await createUser();
    user = gotUser;
    userData = gotUserData;
    
    const {user: gotUser2, userData: gotUserData2} = await createUser2();
    user2 = gotUser2;
    userData2 = gotUserData2;

    const filename = "bunny.png";
    const filepath = path.join(__dirname, "../fixtures/media/folder.png")
    const metadata = {
        owner: user._id,
        parent: "/",
        parentList: "/",
        "IV": initVect,
        // filePath: filepath
    }
    
    file = await createFile(filename, filepath, metadata, user);

    done();

})

afterEach(async(done) => {

    console.log("After each")

    //const gfs = Grid(conn.db, mongoose.mongo);
    let bucket = new mongoose.mongo.GridFSBucket(conn.db);
            
    await User.deleteMany({});

    await Thumbnail.deleteMany({});

    const allFiles = await conn.db.collection("fs.files").find({}).toArray();

    for (let i = 0; i < allFiles.length; i++) {

        const currentFileID = allFiles[i]._id;
        await bucket.delete(ObjectID(currentFileID));
    }
   
    done();
})

test("When giving ID, should send thumbnail data", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const response = await appSession
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .send()
    .expect(200);

    expect(response.body.length).not.toBe(0);
})

test("When giving no authorization for thumbnail data, should return error", async() => {

    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const response = await request(app)
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When giving wrong auth data for thumbnail, should return 403 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const appSession2 = session(app);
    await loginUser(appSession2, userData2);

    const response = await appSession2
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .send()
    .expect(403);

    expect(response.body).toEqual({});
})

test("When not email verified should not get thumbnail data, and return 401", async() => {

    const appSession = session(app);
    
    const {userData: userData3, user: user3} = await createUserNotEmailVerified();
    await loginUser(appSession, userData3);
    
    const thumbnailFile = await createThumbnail(file, file.filename, user3);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const response = await appSession
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When not email verified but email verification disabled should get thumbnail data", async() => {

    env.disableEmailVerification = true;

    const appSession = session(app);
    
    const {userData: userData3, user: user3} = await createUserNotEmailVerified();
    await loginUser(appSession, userData3);

    const initVect = crypto.randomBytes(16);
    const filename = "bunny.png";
    const filepath = path.join(__dirname, "../fixtures/media/folder.png")
    const metadata = {
        owner: user3._id,
        parent: "/",
        parentList: "/",
        "IV": initVect,
    }
    
    const file2 = await createFile(filename, filepath, metadata, user3);

    const thumbnailFile = await createThumbnail(file2, file2.filename, user3);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const response = await appSession
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .send()
    .expect(200);

    expect(response.body.length).not.toBe(0);

    env.disableEmailVerification = undefined;
})

test("When trying to create thumbnail from others users file should not return thumbnail", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const thumbnailFile = await createThumbnail(file, file.filename, user2);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;
    
    expect(thumbnailID).toEqual(undefined)
})
// // Needs Work, cannot phrase binary data?

// // test("When giving public ID, should return public file download", async() => {

// //     const userID = user._id;
// //     const fileID = file._id.toString();
// //     const token = jwt.sign({_id: userID.toString()}, env.password);
// //     await conn.db.collection("fs.files")
// //     .findOneAndUpdate({"_id": ObjectID(fileID), 
// //     "metadata.owner": userID}, 
// //     {"$set": {"metadata.linkType": "public", "metadata.link": token}})

// //     const response = await request(app)
// //     .get(`/file-service/public/download/${fileID}`)
// //     .parse(binaryPhraser)
// //     .buffer()
// //     .end();


// //     //expect(response.body._id).toEqual(fileID);  

// //     // console.log("public", token.token);

// //     // const url = "/file-service/public/download/" + fileID;
// //     // console.log("url", url);
// //     // const response = await request(app).get(url)
// //     // .set("Authorization", `Bearer ${userToken}`)
// //     // .set('content-type', 'application/octet-stream')
// //     // .send()
// //     // .expect(203)
 
// //     // const writeStream = temp.createWriteStream();

// //     //response.pipe(writeStream);
// // })

test("When giving public id, should return public info", async() => {

    const userID = user._id;
    const fileID = file._id.toString();
    const token = jwt.sign({_id: userID.toString()}, env.password).toString();
    await conn.db.collection("fs.files")
    .findOneAndUpdate({"_id": ObjectID(fileID), 
    "metadata.owner": userID}, 
    {"$set": {"metadata.linkType": "public", "metadata.link": token}})

    const response = await request(app)
    .get(`/file-service/public/info/${fileID}/${token}`)
    .send()
    .expect(200);

    expect(response.body._id).toEqual(fileID);
})

test("When giving ID for non public file, should return 404 error", async() => {

    const userID = user._id;
    const fileID = file._id.toString();
    const token = jwt.sign({_id: userID.toString()}, env.password).toString();
    const response = await request(app)
    .get(`/file-service/public/info/${fileID}/${token}`)
    .send()
    .expect(404);

    expect(response.data).toBe(undefined);
})

test("When giving fileID, should return file info", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = file._id;

    const response = await appSession
    .get(`/file-service/info/${fileID}`)
    .send()
    .expect(200);

    expect(response.body._id).toEqual(fileID.toString());
})

test("When not authorized for file info, should return 401 error", async() => {

    const fileID = file._id;

    const response = await request(app)
    .get(`/file-service/info/${fileID}`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When giving wrong auth token for file info, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const fileID = file._id;

    const response = await appSession
    .get(`/file-service/info/${fileID}`)
    .send()
    .expect(404);

    expect(response.body).toEqual({});
})

test("When not email verified should not get file info, and should return 401", async() => {

    const appSession = session(app);
    
    const {userData: userData3, user: user3} = await createUserNotEmailVerified();
    await loginUser(appSession, userData3);

    const initVect = crypto.randomBytes(16);
    const filename = "bunny.png";
    const filepath = path.join(__dirname, "../fixtures/media/folder.png")
    const metadata = {
        owner: user3._id,
        parent: "/",
        parentList: "/",
        "IV": initVect,
    }
    
    const file2 = await createFile(filename, filepath, metadata, user3);

    const fileID = file2._id;

    const response = await appSession
    .get(`/file-service/info/${fileID}`)
    .send()
    .expect(401);

    expect(response.body).toEqual({})
})

test("When not email verified but email verification disabled should return file info", async() => {

    env.disableEmailVerification = true;

    const appSession = session(app);
    
    const {userData: userData3, user: user3} = await createUserNotEmailVerified();
    await loginUser(appSession, userData3);

    const initVect = crypto.randomBytes(16);
    const filename = "bunny.png";
    const filepath = path.join(__dirname, "../fixtures/media/folder.png")
    const metadata = {
        owner: user3._id,
        parent: "/",
        parentList: "/",
        "IV": initVect,
    }
    
    const file2 = await createFile(filename, filepath, metadata, user3);

    const fileID = file2._id;

    const response = await appSession
    .get(`/file-service/info/${fileID}`)
    .send()
    .expect(200);

    expect(response.body._id).toEqual(fileID.toString());

    env.disableEmailVerification = undefined;
})

test("When giving the wrong tempToken for public file info, should return 404 error", async() => {

    const userID = user._id;
    const fileID = file._id.toString();
    const token = jwt.sign({_id: userID.toString()}, env.password).toString();
    const wrongToken = "12345"
    await conn.db.collection("fs.files")
    .findOneAndUpdate({"_id": ObjectID(fileID), 
    "metadata.owner": userID}, 
    {"$set": {"metadata.linkType": "public", "metadata.link": token}})

    const response = await request(app)
    .get(`/file-service/public/info/${fileID}/${wrongToken}`)
    .send()
    .expect(404);

    expect(response.body).toEqual({});
})

test("When giving authorization, should get user quicklist", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const response = await appSession
    .get(`/file-service/quick-list`)
    .send()
    .expect(200);

    expect(response.body.length).toBe(1);
})

test("When giving no authoization for quicklist, should return 401 error", async() => {

    const response = await request(app)
    .get(`/file-service/quick-list`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When giving default query, should return file list", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const response = await appSession
    .get(`/file-service/list`)
    .send({})
    .expect(200);

    expect(response.body.length).toBe(1);
})

test("When giving no authoization for file list, should return 401 error", async() => {

    const response = await request(app)
    .get(`/file-service/list`)
    .send({})
    .expect(401);

    expect(response.body).toEqual({});
})

test("When giving wrong auth for list, should return empty list", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const response = await appSession
    .get(`/file-service/list`)
    .send({})
    .expect(200);

    expect(response.body.length).toBe(0);
})

test("When authorized should get video cookie", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    await appSession
    .get(`/file-service/list`)
    .send("/file-service/download/access-token-stream-video")
    .expect(200);
})

test("When not authorized should not get video token and return 401 error", async() => {

    await request(app)
    .get(`/file-service/list`)
    .send("/file-service/download/access-token-stream-video")
    .expect(401);
})

test("When authorized should return suggested list", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    await appSession
    .get(`/file-service/suggested-list`)
    .send()
    .expect(200);
})

test("When not authorized should not return suggested list", async() => {

    const response =await request(app)
    .get(`/file-service/suggested-list`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})

test("When giving fileID and title, should rename file", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = file._id;

    await appSession
    .patch(`/file-service/rename`)
    .send({
        id: fileID,
        title: "new name"
    })
    .expect(200);
})

test("When not authoized for rename file, should return 401 error", async() => {

    const fileID = file._id;

    await request(app)
    .patch(`/file-service/rename`)
    .send({
        id: fileID,
        title: "new name"
    })
    .expect(401);
})

test("When giving wrong authorization token for rename file, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const fileID = file._id;

    await appSession
    .patch(`/file-service/rename`)
    .send({
        id: fileID,
        title: "new name"
    })
    .expect(404);
})

test("When giving fileID and parent, should move file", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = file._id;
    const userID = user._id;

    const folder = new Folder({
        owner: userID,
        name: "folder",
        parent: "/",
        parentList: ["/"]
    })

    await folder.save();

    const folderID = folder._id;

    await appSession
    .patch(`/file-service/move`)
    .send({
        id: fileID, 
        parent: folderID
    })
    .expect(200);
})

test("When not authorized should not move file and return 401", async() => {

    const appSession = session(app);

    const fileID = file._id;
    const userID = user._id;

    const folder = new Folder({
        owner: userID,
        name: "folder",
        parent: "/",
        parentList: ["/"]
    })

    await folder.save();

    const folderID = folder._id;

    await appSession
    .patch(`/file-service/move`)
    .send({
        id: fileID, 
        parent: folderID
    })
    .expect(401);
})

test("When giving wrong authorization should not move file and return 404", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const fileID = file._id;
    const userID = user._id;

    const folder = new Folder({
        owner: userID,
        name: "folder",
        parent: "/",
        parentList: ["/"]
    })

    await folder.save();

    const folderID = folder._id;

    await appSession
    .patch(`/file-service/move`)
    .send({
        id: fileID, 
        parent: folderID
    })
    .expect(404);

})

test("When giving a parentID that does not exist, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = file._id;
    
    await appSession
    .patch(`/file-service/move`)
    .send({
        id: fileID, 
        parent: "123456789012"
    })
    .expect(404);
})

test("When giving fileID should remove file", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = file._id;

    await appSession
    .delete(`/file-service/remove`)
    .send({
        id: fileID, 
    })
    .expect(200);
})

test("When giving fileID that does not exist for remove file, should return 404 error", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData);

    const fileID = "123456789012";

    await appSession
    .delete(`/file-service/remove`)
    .send({
        id: fileID, 
    })
    .expect(404);
})

test("When not authorized should not remove file and return 401", async() => {

    const appSession = session(app);

    const fileID = file._id;

    await appSession
    .delete(`/file-service/remove`)
    .send({
        id: fileID, 
    })
    .expect(401);
})

test("When giving wrong authorization should not remove file and return 404", async() => {

    const appSession = session(app);

    await loginUser(appSession, userData2);

    const fileID = file._id;

    await appSession
    .delete(`/file-service/remove`)
    .send({
        id: fileID, 
    })
    .expect(404);
})