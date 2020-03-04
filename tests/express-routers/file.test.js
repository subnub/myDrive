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

process.env.KEY = "1234";
env.key = "1234";


beforeEach(async(done) => {

    if (conn.readyState === 0) {

        conn.once("open", async() => {


            const initVect = crypto.randomBytes(16);
            
            // user = await createUser();
            // userToken = user.tokens[0].token;
            const {user: gotUser, token: gotToken} = await createUser();
            user = gotUser;
            userToken = gotToken;
            
            // user2 = await createUser2();
            // userToken2 = user2.tokens[0].token;
            const {user: gotUser2, token: gotToken2} = await createUser2();
            user2 = gotUser2;
            userToken2 = gotToken2;

            const filename = "bunny.png";
            const filepath = path.join(__dirname, "../fixtures/media/check.svg")
            const metadata = {
                owner: user._id,
                parent: "/",
                parentList: "/",
                "IV": initVect
            }
            
            file = await createFile(filename, filepath, metadata, user);
    
            done();

        })

    } else {

        const initVect = crypto.randomBytes(16);

         // user = await createUser();
        // userToken = user.tokens[0].token;
        const {user: gotUser, token: gotToken} = await createUser();
        user = gotUser;
        userToken = gotToken;
            
        // user2 = await createUser2();
            // userToken2 = user2.tokens[0].token;
        const {user: gotUser2, token: gotToken2} = await createUser2();
        user2 = gotUser2;
        userToken2 = gotToken2;
            
        // user = await createUser();
        // userToken = user.tokens[0].token;

        // user2 = await createUser2();
        // userToken2 = user2.tokens[0].token;
        
        const filename = "bunny.png";
        const filepath = path.join(__dirname, "../fixtures/media/check.svg")
        const metadata = {
            owner: user._id,
            parent: "/",
            parentList: "/",
            "IV": initVect
        }
        
        file = await createFile(filename, filepath, metadata, user);

        done();
    }

})

afterEach(async(done) => {

    console.log("After each")

    //const gfs = Grid(conn.db, mongoose.mongo);
    let bucket = new mongoose.mongo.GridFSBucket(conn.db);
            
    await User.deleteMany({});

    const allFiles = await conn.db.collection("fs.files").find({}).toArray();

    for (let i = 0; i < allFiles.length; i++) {

        const currentFileID = allFiles[i]._id;
        await bucket.delete(ObjectID(currentFileID));
    }
   
    done();
})

// To-do maybe

// test("When giving user, should send transcoded video response", async() => {

//     const response = await request(app)
//     .post(`/file-service/transcode-video`)
//     .set("Authorization", `Bearer ${userToken}`)
//     .send({file})
//     .expect(200);

//     console.log("response", response.body);
// })

// test("When giving wrong user for transcode video, should return 401 error", async() => {

//     const user2 = await createUser2();
//     const userToken2 = user2.tokens[0].token;

//     await request(app)
//     .get(`/file-service/transcode-video`)
//     .set("Authorization", `Bearer ${userToken2}`)
//     .send(user)
//     .expect(401);
// })

test("When giving ID, should send thumbnail data", async() => {

    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

    const response = await request(app)
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .set("Authorization", `Bearer ${userToken}`)
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

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving wrong auth data for thumbnail, should return 401 error", async() => {


    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;


    const response = await request(app)
    .get(`/file-service/thumbnail/${thumbnailID}`)
    .set("Authorization", `Bearer ${userToken2}`)
    .send()
    .expect(401);

    expect(response.body).toEqual({});
})


// Needs Work, cannot phrase binary data?

// test("When giving public ID, should return public file download", async() => {

//     const userID = user._id;
//     const fileID = file._id.toString();
//     const token = jwt.sign({_id: userID.toString()}, env.password);
//     await conn.db.collection("fs.files")
//     .findOneAndUpdate({"_id": ObjectID(fileID), 
//     "metadata.owner": userID}, 
//     {"$set": {"metadata.linkType": "public", "metadata.link": token}})

//     const response = await request(app)
//     .get(`/file-service/public/download/${fileID}`)
//     .parse(binaryPhraser)
//     .buffer()
//     .end();


//     //expect(response.body._id).toEqual(fileID);  

//     // console.log("public", token.token);

//     // const url = "/file-service/public/download/" + fileID;
//     // console.log("url", url);
//     // const response = await request(app).get(url)
//     // .set("Authorization", `Bearer ${userToken}`)
//     // .set('content-type', 'application/octet-stream')
//     // .send()
//     // .expect(203)
 
//     // const writeStream = temp.createWriteStream();

//     //response.pipe(writeStream);
// })

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
    .set("Authorization", `Bearer ${userToken}`)
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
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(404);

    expect(response.data).toBe(undefined);
})

test("When giving fileID, should return file info", async() => {

    const fileID = file._id;

    const response = await request(app)
    .get(`/file-service/info/${fileID}`)
    .set("Authorization", `Bearer ${userToken}`)
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

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving wrong auth token for file info, should return 404 error", async() => {

    const fileID = file._id;

    const response = await request(app)
    .get(`/file-service/info/${fileID}`)
    .set("Authorization", `Bearer ${userToken2}`)
    .send()
    .expect(404);

    expect(response.body).toEqual({});
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
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(404);

    expect(response.body).toEqual({});
})

test("When giving authorization, should get user quicklist", async() => {

    const response = await request(app)
    .get(`/file-service/quick-list`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);

    expect(response.body.length).toBe(1);
})

test("When giving no authoization for quicklist, should return 401 error", async() => {

    const response = await request(app)
    .get(`/file-service/quick-list`)
    .send()
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving default query, should return file list", async() => {

    const response = await request(app)
    .get(`/file-service/list`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({})
    .expect(200);

    expect(response.body.length).toBe(1);
})

test("When giving no authoization for file list, should return 401 error", async() => {

    const response = await request(app)
    .get(`/file-service/list`)
    .send({})
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving wrong auth for list, should return empty list", async() => {

    const response = await request(app)
    .get(`/file-service/list`)
    .set("Authorization", `Bearer ${userToken2}`)
    .send({})
    .expect(200);

    expect(response.body.length).toBe(0);
})

test("When autheniticated should generate download token", async() => {

    await request(app)
    .get(`/file-service/download/get-token`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);
})

test("When not authenticated, should not generate download token", async() => {

    await request(app)
    .get(`/file-service/download/get-token`)
    .send()
    .expect(401);
})

test("When authenticated and cookie should generate video token", async() => {
    
    await request(app)
    .get(`/file-service/download/get-token-video`)
    .set("Authorization", `Bearer ${userToken}`)
    .set("uuid", 1234)
    .send()
    .expect(200);
})

test("When not authenticated, should not generate video token", async() => {

    await request(app)
    .get(`/file-service/download/get-token-video`)
    .set("uuid", 1234)
    .send()
    .expect(401);
})

test("When not giving a Cookie, should not generate video token", async() => {

    await request(app)
    .get(`/file-service/download/get-token-video`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(401);
})

test("When giving tempToken, should remove temp token", async() => {

    const token = await request(app)
    .get(`/file-service/download/get-token-video`)
    .set("Authorization", `Bearer ${userToken}`)
    .set("uuid", 1234)
    .send()
    .expect(200);

    await request(app)
    .delete(`/file-service/remove/token-video/${token}`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);

})

test("When not authorized, should not remove temp token", async() => {
    
    const token = await request(app)
    .get(`/file-service/download/get-token-video`)
    .set("Authorization", `Bearer ${userToken}`)
    .set("uuid", 1234)
    .send()
    .expect(200);

    await request(app)
    .delete(`/file-service/remove/token-video/${token}`)
    .send()
    .expect(401);
})

test("When authorized should return suggested list", async() => {

    await request(app)
    .get(`/file-service/suggested-list`)
    .set("Authorization", `Bearer ${userToken}`)
    .send()
    .expect(200);
})

test("When not authorized should not return suggested list", async() => {

    const response =await request(app)
    .get(`/file-service/suggested-list`)
    .send()
    .expect(401);

    expect(response.body).toEqual({
        "error": "Error Authenticating",
    });
})

test("When giving fileID and title, should rename file", async() => {

    const fileID = file._id;

    await request(app)
    .patch(`/file-service/rename`)
    .set("Authorization", `Bearer ${userToken}`)
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

test("When giving fileID and parent, should move file", async() => {

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

    await request(app)
    .patch(`/file-service/move`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: fileID, 
        parent: folderID
    })
    .expect(200);
})

test("When giving a parentID that does not exist, should return 500 error", async() => {

    const fileID = file._id;
    
    await request(app)
    .patch(`/file-service/move`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: fileID, 
        parent: "123456789012"
    })
    .expect(404);
})

test("When giving fileID should remove file", async() => {

    const fileID = file._id;

    await request(app)
    .delete(`/file-service/remove`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: fileID, 
    })
    .expect(200);
})

test("When giving fileID that does not exist for remove file, should return 404 error", async() => {

    const fileID = "123456789012";

    await request(app)
    .delete(`/file-service/remove`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({
        id: fileID, 
    })
    .expect(404);
})