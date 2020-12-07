import User from "../../../../dist/models/user";
import mongoose from "../../../../dist/db/mongoose";
const conn = mongoose.connection;
const createUser = require("../../../fixtures/createUser");
const createUser2 = require("../../../fixtures/createUser2");
const path = require("path");
const createFile = require("../../../fixtures/createFile");
import UtilsFile from "../../../../dist/db/utils/fileUtils/index";
const ObjectID = require('mongodb').ObjectID
const jwt = require("jsonwebtoken");
const utilsFile = new UtilsFile();

let user; 
let file;

process.env.KEY = "1234";


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

    const {user: gotUser} = await createUser();
    user = gotUser;
    
    const filename = "bunny.mp4";
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: user._id,
        parent: "/",
        parentList: "/"
    }
    
    file = await createFile(filename, filepath, metadata, user);

    done();
})

afterEach( async(done) => {

    let bucket = new mongoose.mongo.GridFSBucket(conn.db);
            
    await User.deleteMany({});

    const allFiles = await conn.db.collection("fs.files").find({}).toArray();

    for (let i = 0; i < allFiles.length; i++) {

        const currentFileID = allFiles[i]._id;
        await bucket.delete(ObjectID(currentFileID));
    }
   
    done();

})


test("When giving fileID, should return public file", async() => {
    
    const fileID = file._id;
    const tempToken = file.metadata.link;

    const recievedFile = await utilsFile.getPublicInfo(fileID, tempToken);

    expect(recievedFile._id).toEqual(fileID);

})

test("When giving wrong fileID, should not return public file", async() => {

    const wrongFileID = "123456789012";

    const recievedFile = await utilsFile.getFileInfo(wrongFileID);

    expect(recievedFile).toBe(null);
})

test("When giving the wrong tempToken, should not return public file", async() => {

    const fileID = file._id;
    const wrongTempToken = "1234"

    const recievedFile = await utilsFile.getPublicInfo(fileID, wrongTempToken);

    expect(recievedFile).toBe(null);
})

test("When giving fileID and userID, should remove public file link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})


       
    await utilsFile.removeLink(fileID, userID);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});
    

    
    expect(updatedFile.metadata.linkType).toBe(undefined);
})

test("When giving the wrong fileID, should not remove public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    const wrongFileID = "123456789012";
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})

    

    await utilsFile.removeLink(wrongFileID, userID);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});



    expect(updatedFile.metadata.linkType).toEqual("public")
})

test("When giving the wrong userID, should not remove public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    const wrongUserID = "123456789012";
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})


    
    await utilsFile.removeLink(fileID, wrongUserID);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});



    expect(updatedFile.metadata.linkType).toEqual("public")
})

test("When giving fileID, should remove one time public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "one", "metadata.link": token}})


       
    await utilsFile.removeOneTimePublicLink(fileID);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});
    

    
    expect(updatedFile.metadata.linkType).toBe(undefined);
})

test("When giving the wrong fileID, should not remove one time public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    const wrongFileID = "123456789012";
    await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "one", "metadata.link": token}})
       
    await utilsFile.removeOneTimePublicLink(wrongFileID);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});
    

    
    expect(updatedFile.metadata.linkType).toBe("one");
})

test("When giving fileID, userID, and token, should make file public", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;


    await utilsFile.makePublic(fileID, userID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe("public")
})

test("When giving wrong fileID, should not make file public", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    const wrongFileID = "123456789012";


    await utilsFile.makePublic(wrongFileID, userID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe(undefined)
})

test("When giving wrong userID, should not make file public", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const wrongUserID = "123456789012";


    await utilsFile.makePublic(fileID, wrongUserID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe(undefined)
})

test("When giving fileID, userID, and token, should make one time public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;


    await utilsFile.makeOneTimePublic(fileID, userID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe("one")
})

test("When giving wrong fileID, should not make one time public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const userID = user._id;
    const wrongFileID = "123456789012";


    await utilsFile.makeOneTimePublic(wrongFileID, userID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe(undefined)
})

test("When giving wrong userID, should not make one time public link", async() => {

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD)
    const fileID = file._id;
    const wrongUserID = "123456789012";


    await utilsFile.makeOneTimePublic(fileID, wrongUserID, token);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.metadata.linkType).toBe(undefined)
})

test("When giving fileID and userID, should return file", async() => {

    const fileID = file._id;
    const userID = user._id;

    const recievedFile = await utilsFile.getFileInfo(fileID, userID);


    expect(recievedFile._id).toEqual(fileID);
})

test("When giving wrong fileID, should not return file", async() => {

    const userID = user._id;
    const wrongFileID = "123456789012";

    const recievedFile = await utilsFile.getFileInfo(wrongFileID, userID);

    expect(recievedFile).toEqual(null);
})

test("When giving wrong userID, should not return file", async() => {

    const fileID = file._id;
    const wrongUserID = "123456789012";

    const recievedFile = await utilsFile.getFileInfo(fileID, wrongUserID);

    expect(recievedFile).toEqual(null);
})

test("When giving userID, should return quicklist", async() => {

    const userID = user._id;

    const recievedList = await utilsFile.getQuickList(userID);

    expect(recievedList.length).toBe(1);
})

test("When giving wrong userID, should not return quicklist", async() => {

    const wrongUserID = "123456789012";

    const recievedList = await utilsFile.getQuickList(wrongUserID);

    expect(recievedList.length).toBe(0);
})

test("When giving default query object, should return a filtered file list", async() => {
    
    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    const fileFour = await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    const fileFive = await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
    }

    const defaultSortBy = {uploadDate: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(3);
    expect(recievedList[0]._id).toEqual(fileThree._id);
    expect(recievedList[1]._id).toEqual(fileTwo._id);
    expect(recievedList[2]._id).toEqual(file._id);
    expect(recievedList.includes(fileFour)).toBe(false);
    expect(recievedList.includes(fileFive)).toBe(false);
})

test("When giving owner, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    const fileFive = await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": "1234",
        "metadata.parent": "/",
    }

    const defaultSortBy = {uploadDate: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);


    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileFive._id);
})

test("When giving parent, should return a filtered file list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    const fileFour = await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "1234",
    }

    const defaultSortBy = {uploadDate: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileFour._id);
})

test("When giving limit, should return filitered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
    }

    const defaultSortBy = {uploadDate: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 1);



    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileThree._id);
})

test("When giving ascending upload date, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
    }

    const defaultSortBy = {uploadDate: 1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(3);
    expect(recievedList[0]._id).toEqual(file._id);
    expect(recievedList[1]._id).toEqual(fileTwo._id);
    expect(recievedList[2]._id).toEqual(fileThree._id);
})

test("When giving decending filename, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
    }


    const defaultSortBy = {filename: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(3);
    expect(recievedList[0]._id).toEqual(fileThree._id);
    expect(recievedList[1]._id).toEqual(file._id);
    expect(recievedList[2]._id).toEqual(fileTwo._id);
})

test("When giving ascending filename, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
    }


    const defaultSortBy = {filename: 1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(3);
    expect(recievedList[0]._id).toEqual(fileTwo._id);
    expect(recievedList[1]._id).toEqual(file._id);
    expect(recievedList[2]._id).toEqual(fileThree._id);
})

test("When giving start at with default values, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
        "uploadDate": {$lt:  new Date(fileThree.uploadDate)}
    }

    const defaultSortBy = {uploadDate: -1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(2);
    expect(recievedList[0]._id).toEqual(fileTwo._id);
    expect(recievedList[1]._id).toEqual(file._id);
})

test("When giving start at with ascending data, should return filtered list", async() => {

    const userID = user._id;
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID, 
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }
    
    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    const fileThree = await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);

    const queryObj = {
        "metadata.owner": userID,
        "metadata.parent": "/",
        "uploadDate": {$gt:  new Date(fileTwo.uploadDate)}
    }

    const defaultSortBy = {uploadDate: 1}



    const recievedList = await utilsFile.getList(queryObj, defaultSortBy, 50);



    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileThree._id);
})

// test("When giving user and temp token, should remove temp token", async() => {

//     const token = jwt.sign({_id: user._id}, process.env.PASSWORD, {expiresIn: 2});
//     user.tempTokens = user.tempTokens.concat({token})
//     await user.save();


//     const recievedUser = await utilsFile.removeTempToken(user, token);
//     await recievedUser.save();
//     const updatedUser = await User.findById(user._id);


//     expect(updatedUser.tempTokens.length).toBe(0);
// })

// test("When giving the wrong temp token, should not remove temp token", async() => {

//     const token = jwt.sign({_id: user._id}, process.env.PASSWORD, {expiresIn: 2});
//     user.tempTokens = user.tempTokens.concat({token})
//     await user.save();


//     const recievedUser = await utilsFile.removeTempToken(user, "1234");
//     await recievedUser.save();
//     const updatedUser = await User.findById(user._id);


//     expect(updatedUser.tempTokens.length).toBe(1);
//     expect(updatedUser.tempTokens[0].token._id).toBe(token._id)
// })

// test("When giving fileID and userID, should remove transcoded video", async() => {

//     const fileID = file._id;
//     const userID = user._id;
//     await await conn.db.collection("fs.files")
//     .findOneAndUpdate({"_id": ObjectID(fileID), "metadata.owner": userID}, 
//     {"$set": {"metadata.transcoded": true}})

//     await utilsFile.removeTranscodeVideo(fileID, userID);
//     const updatedFile = await conn.db.collection("fs.files")
//             .findOne({_id: fileID});


//     expect(updatedFile.metadata.transcoded).toBe(undefined);
// })

// test("When giving wrong fileID, should not remove transcoded video", async() => {

//     const fileID = file._id;
//     const userID = user._id;
//     const wrongFileID = "123456789012";
//     await await conn.db.collection("fs.files")
//     .findOneAndUpdate({"_id": ObjectID(fileID), "metadata.owner": userID}, 
//     {"$set": {"metadata.transcoded": true}})

//     await utilsFile.removeTranscodeVideo(wrongFileID, userID);
//     const updatedFile = await conn.db.collection("fs.files")
//             .findOne({_id: fileID});


//     expect(updatedFile.metadata.transcoded).toBe(true);
// })

// test("When giving the wrong userID, should not remove transcoded video", async() => {

//     const fileID = file._id;
//     const userID = user._id;
//     const wrongUserID = "123456789012";
//     await await conn.db.collection("fs.files")
//     .findOneAndUpdate({"_id": ObjectID(fileID), "metadata.owner": userID}, 
//     {"$set": {"metadata.transcoded": true}})

//     await utilsFile.removeTranscodeVideo(fileID, wrongUserID);
//     const updatedFile = await conn.db.collection("fs.files")
//             .findOne({_id: fileID});


//     expect(updatedFile.metadata.transcoded).toBe(true);
// })

test("When giving userID and search query, should return file list", async() => {

    const userID = user._id;
    let search = "apple";
    search = new RegExp(search, 'i')
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }

    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileSearchList(userID, fileTwo.filename);


    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileTwo._id);
})

test("When giving wrong userID, should not return search list", async() => {

    const userID = user._id;
    const wrongUserID = "123456789012"
    let search = "apple";
    search = new RegExp(search, 'i')
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }

    const fileTwo = await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileSearchList(wrongUserID, fileTwo.filename);


    expect(recievedList.length).toBe(0);
})

test("When giving fileID, userID, and title, should rename file", async() => {

    const userID = user._id;
    const fileID = file._id;
    const newName = "fin.mp4";

    await utilsFile.renameFile(fileID, userID, newName);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.filename).toBe(newName);
})

test("When giving wrong fileID, should not rename file", async() => {

    const userID = user._id;
    const fileID = file._id;
    const wrongFileID =  "123456789012"
    const newName = "fin.mp4";

    await utilsFile.renameFile(wrongFileID, userID, newName);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.filename).toBe(file.filename);
})

test("When giving the wrong userID, should not rename file", async() => {

    const fileID = file._id;
    const wrongUserID =  "123456789012"
    const newName = "fin.mp4";

    await utilsFile.renameFile(fileID, wrongUserID, newName);
    const updatedFile = await conn.db.collection("fs.files")
            .findOne({_id: fileID});


    expect(updatedFile.filename).toBe(file.filename);
})

test("When giving userID and parent string, should return file list by parent", async() => {

    const userID = user._id;
   
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }

    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    const fileFour = await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileListByParent(userID, fileFour.metadata.parentList)


    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileFour._id);
})

test("When giving the wrong userID, should not return file list by parent", async() => {

    const userID = user._id;
    const wrongUserID = "123456789012"
   
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }

    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    const fileFour = await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileListByParent(wrongUserID, fileFour.metadata.parentList)


    expect(recievedList.length).toBe(0);
})

test("When giving the userID, should return file list by owner", async() => {

    const userID = user._id;

    const {user: user2} = await createUser2();
   
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: user2._id, 
        parent: "/",
        parentList:"/,1234"
    }

    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    const fileFive = await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileListByOwner(fileFive.metadata.owner);


    expect(recievedList.length).toBe(1);
    expect(recievedList[0]._id).toEqual(fileFive._id);
})

test("When giving the wrong userID, should not return file list by owner", async() => {

    const userID = user._id;
    const wrongUserID = "123456789012"
   
    const filepath = path.join(__dirname, "../../../fixtures/media/check.svg")
    const metadata = {
        owner: userID,
        parent: "/",
        parentList: "/"
    }

    const metadataDifferentParent = {
        owner: userID,
        parent: "1234",
        parentList:"/,1234"
    }

    const metadataDifferentOwner = {
        owner: "1234", 
        parent: "/",
        parentList:"/,1234"
    }

    await createFile("apple.mp4", filepath, metadata, user);
    await createFile("coconut.mp4", filepath, metadata, user);
    await createFile("dinnerbone.mp4", filepath, metadataDifferentParent, user);
    await createFile("elephant.mp4", filepath, metadataDifferentOwner, user);
    const recievedList = await utilsFile.getFileListByOwner(wrongUserID);


    expect(recievedList.length).toBe(0);
})

test("When giving fileID, userID, parent, and parentList, should move file", async() => {

    const fileID = file._id;
    const userID = user._id;
    const parent = "1234";
    const parentList = ["/", "1234"].toString();


    await utilsFile.moveFile(fileID, userID, parent, parentList);
    const updatedFile = await conn.db.collection("fs.files")
    .findOne({_id: fileID});


    expect(updatedFile.metadata.parent).toBe(parent);
    expect(updatedFile.metadata.parentList).toBe(parentList);
})

test("When giving wrong userID for move file, should not remove file", async() => {

    const fileID = file._id;
    const wrongUserID = "123456789012";
    const parent = "1234";
    const parentList = ["/", "1234"].toString();

    await utilsFile.moveFile(fileID, wrongUserID, parent, parentList);
    const updatedFile = await conn.db.collection("fs.files")
    .findOne({_id: fileID});

    expect(updatedFile.metadata.parent).toBe(file.metadata.parent);
    expect(updatedFile.metadata.parentList).toBe(file.metadata.parentList);
})

