const User = require("../../../src/models/user");
const mongoose = require("../../../src/db/mongoose");
const conn = mongoose.connection;
const createUser = require("../../fixtures/createUser");
const path = require("path");
const createFile = require("../../fixtures/createFile");
const crypto = require("crypto");
const createThumbnail = require("../../../src/services/FileService/utils/createThumbnail");
const env = require("../../../src/enviroment/env");
const jwt = require("jsonwebtoken");
const ObjectID = require('mongodb').ObjectID
const Folder = require("../../../src/models/folder");
const FileService = require("../../../src/services/FileService");
const fileService = new FileService();

let user; 
let file;

process.env.KEY = "1234";
env.key = "1234";

beforeEach(async(done) => {

    if (conn.readyState === 0) {

        conn.once("open", async() => {

            const initVect = crypto.randomBytes(16);
            
            // user = await createUser();
            const {user: gotUser} = await createUser();
            user = gotUser;
            
            const filename = "bunny.png";
            const filepath = path.join(__dirname, "../../fixtures/media/check.svg")
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
            //user = await createUser();
            const {user: gotUser} = await createUser();
            user = gotUser;
            
            const filename = "bunny.png";
            const filepath = path.join(__dirname, "../../fixtures/media/check.svg")
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


afterEach( async(done) => {

    //const gfs = Grid(conn.db, mongoose.mongo);
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

test("When giving user, and thumbnail id, should get thumbnail" , async() => {
  
    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;

   
    const recievedThumbnail = await fileService.getThumbnail(user, thumbnailID);


    expect(recievedThumbnail.buffer.length).not.toBe(0);
})

test("When giving the wrong user for thumbnail, should throw not authorized error", async() => {

    const thumbnailFile = await createThumbnail(file, file.filename, user);
    const thumbnailID = thumbnailFile.metadata.thumbnailID;
    const wrongUser = {
        _id: "123456789012"
    }

    await expect(fileService.getThumbnail(wrongUser, thumbnailID)).rejects.toThrow();
})

test("When giving file, should remove one time link", async() => {

    await fileService.removePublicOneTimeLink(file);
})

test("When giving userID, and fileID, should remove public link", async() => {

    const userID = user._id;
    const fileID = file._id;

    await fileService.removeLink(userID, fileID);
})

test("When giving the wrong userID to remove public link, should throw not found error", async() => {

    const wrongUserID = "123456789012";
    const fileID = file._id;

    await expect(fileService.removeLink(wrongUserID, fileID)).rejects.toThrow();
})

test("When giving user, and fileID, should make file public and return token", async() => {

    const fileID = file._id;

    const recievedToken = await fileService.makePublic(user, fileID);

    expect(recievedToken.length).not.toBe(0);
})

test("When giving the wrong user to make file public, should throw not found error", async() => {

    const wrongUser = {
        _id: "123456789012"
    }
    const fileID = file._id;

    await expect(fileService.makePublic(wrongUser, fileID)).rejects.toThrow();
})

test("When giving fileID, should return file info if public", async() => {

    const userID = user._id;
    const fileID = file._id;
    const token = jwt.sign({_id: userID.toString()}, env.password);
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})

    
    const receivedFile = await fileService.getPublicInfo(fileID, token);

    expect(receivedFile).not.toBe(null);
    expect(receivedFile).not.toBe(undefined);
})

test("When giving fileID of a file thats not public, should throw not found error", async() => {

    const fileID = file._id;

    await expect(fileService.getPublicInfo(fileID)).rejects.toThrow();
})

test("When giving wrong tempToken for public file, should throw not found error", async() => {

    const userID = user._id;
    const fileID = file._id;
    const token = jwt.sign({_id: userID.toString()}, env.password);
    const wrongTempToken = "12345";
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})

    await expect(fileService.getPublicInfo(fileID, wrongTempToken)).rejects.toThrow();
})

test("When giving userID and fileID, should make one time public link", async() => {

    const userID = user._id;
    const fileID = file._id;

    await fileService.makeOneTimePublic(userID, fileID);
})

test("When giving wrong userID for one time public link, should throw not found error", async() => {

    const wrongUserID = "123456789012";
    const fileID = file._id;

    await expect(fileService.makeOneTimePublic(wrongUserID, fileID)).rejects.toThrow();
})

test("When giving userID and fileID, should return file info", async() => {

    const userID = user._id;
    const fileID = file._id;

    const receivedFile = await fileService.getFileInfo(userID, fileID);

    expect(receivedFile).not.toBe(null);
    expect(receivedFile).not.toBe(undefined);
})

test("When giving the wrong userID for file info, should throw not found error", async() => {

    const wrongUserID = "123456789012";
    const fileID = file._id;

    await expect(fileService.getFileInfo(wrongUserID, fileID)).rejects.toThrow();
})

test("When giving userID, should return quicklist", async() => {

    const userID = user._id;

    const receivedQuickList = await fileService.getQuickList(userID);

    expect(receivedQuickList.length).toBe(1);
})

test("When giving wrong userID for quicklist, should return list with 0 length", async() => {

    const wrongUserID = "123456789012";

    const receivedQuickList = await fileService.getQuickList(wrongUserID);

    expect(receivedQuickList.length).toBe(0);
})

test("When giving userID, and default query, should get file list", async() => {

    const userID = user._id;

    const receivedFileList = await fileService.getList(userID, {});

    expect(receivedFileList.length).toBe(1);
})

test("When giving wrong userID for file list, should return list with 0 length", async() => {

    const wrongUserID = "123456789012";

    const receivedList = await fileService.getList(wrongUserID, {});

    expect(receivedList.length).toBe(0);
})

test("When giving user, should create download token", async() => {

    const recievedToken = await fileService.getDownloadToken(user);

    expect(recievedToken.length).not.toBe(0);
})

test("When giving user and cookie, should create video download token", async() => {

    const recievedToken = await fileService.getDownloadTokenVideo(user, {});

    expect(recievedToken.length).not.toBe(0);
})

test("When giving user and tempToken, should remove temp token", async() => {

    const tempToken = await user.generateTempAuthToken();

    await fileService.removeTempToken(user, tempToken);
})

test("When giving userID and search query, should return suggested list", async() => {

    const userID = user._id;
    const search = "bunn";

    const {fileList} = await fileService.getSuggestedList(userID, search);

    expect(fileList.length).toBe(1);
})

test("When giving wrong userID for suggested list, should return list with length of 0", async() => {

    const wrongUserID = "123456789012";
    const search = "bunn";

    const {fileList} = await fileService.getSuggestedList(wrongUserID, search);

    expect(fileList.length).toBe(0);
})

test("When giving userID, fileID, and title, should rename file", async() => {

    const userID = user._id;
    const fileID = file._id;
    const title = "new name";

    await fileService.renameFile(userID, fileID, title);
})

test("When giving the wrong userID for rename file, should throw not found error", async() => {

    const wrongUserID = "123456789012";
    const fileID = file._id;
    const title = "new name";

    await expect(fileService.renameFile(wrongUserID, fileID, title)).rejects.toThrow();
})

test("When giving the userID, fileID, and parentID should move file", async() => {

    const userID = user._id;
    const fileID = file._id;
    const folder = new Folder({
        owner: user._id,
        parent: "/",
        parentList: ["/"],
        name: "folder"
    });

    await folder.save();

    await fileService.moveFile(userID, fileID, folder._id)
})

test("When giving the wrong userID for move file should throw a not found error", async() => {

    const wrongUserID = "123456789012";
    const fileID = file._id;
    const folder = new Folder({
        owner: user._id,
        parent: "/",
        parentList: ["/"],
        name: "folder"
    });

    await folder.save();

    await expect(fileService.moveFile(wrongUserID, fileID, folder._id)).rejects.toThrow();
})

test("When giving an non existing folderID for file move, should throw not found error", async() => {

    const userID = user._id;
    const fileID = file._id;
    const wrongFolderID = "123456789012";

    await expect(fileService.moveFile(userID, fileID, wrongFolderID)).rejects.toThrow();
})

// test("When giving userID, and fileID, should remove file", async() => {

//     const userID = user._id;
//     const fileID = file._id;

//     await fileService.deleteFile(userID, fileID);
// })

// test("When giving the wrong userID for delete file, should throw not found error", async() => {

//     const wrongUserID = "123456789012";
//     const fileID = file._id;

//     await expect(fileService.deleteFile(wrongUserID, fileID)).rejects.toThrow();
// })