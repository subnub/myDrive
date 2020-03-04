const mongoose = require("../../mongoose")
const conn = mongoose.connection;
const ObjectID = require('mongodb').ObjectID

const DbUtil = function() {

    this.getPublicFile = async(fileID) => {

        let file = await conn.db.collection("fs.files")
        .findOne({"_id": ObjectID(fileID)});

        return file;
    }

    this.removeOneTimePublicLink = async(fileID) => {

        const file = await conn.db.collection("fs.files")
                .findOneAndUpdate({"_id": ObjectID(fileID)}, {
                    "$unset": {"metadata.linkType": "", "metadata.link": ""}});

        return file;
    
    }

    this.removeLink = async(fileID, userID) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$unset": {"metadata.linkType": "", "metadata.link": ""}})

        return file;
    }

    this.makePublic = async(fileID, userID, token) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}})

        return file;
    }

    this.getPublicInfo = async(fileID, tempToken) => {

        const file = await conn.db.collection("fs.files")
            .findOne({"_id": ObjectID(fileID), "metadata.link": tempToken})

        return file;
    }

    this.makeOneTimePublic = async(fileID, userID, token) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "one", "metadata.link": token}})

        return file;
    }

    this.getFileInfo = async(fileID, userID) => {

        const file = await conn.db.collection("fs.files")
            .findOne({"metadata.owner": userID, "_id": ObjectID(fileID)});

        return file;
    }

    this.getQuickList = async(userID) => {

        const fileList = await conn.db.collection("fs.files")
            .find({"metadata.owner": userID})
            .sort({uploadDate: -1})
            .limit(10)
            .toArray();

        return fileList;
    }

    this.getList = async(queryObj, sortBy, limit) => {

        const fileList = await conn.db.collection("fs.files")
            .find(queryObj)
            .sort(sortBy)
            .limit(limit)
            .toArray();


        return fileList;
    }

    this.removeTempToken = async(user, tempToken) => {
    
        user.tempTokens = user.tempTokens.filter((filterToken) => {
            
            return filterToken.token !== tempToken;
        });

        return user;
    }

    this.removeTranscodeVideo = async(fileID, userID) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), "metadata.owner": userID}, 
            {"$unset": {"metadata.transcoded": "", "metadata.transcodedIV": "", 
            "metadata.transcoded_size": "", "metadata.transcodedID": ""}})
    
        return file;
    }

    this.getFileSearchList = async(userID, searchQuery) => {

        const fileList = await conn.db.collection("fs.files")
        .find({"metadata.owner": userID, "filename": searchQuery})
        .limit(10)
        .toArray();

        return fileList;
    }

    this.renameFile = async(fileID, userID, title) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, {"$set": {"filename": title}})
    
        return file;
    }

    this.moveFile = async(fileID, userID, parent, parentList) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": ObjectID(fileID), 
            "metadata.owner": userID}, {"$set": {"metadata.parent": parent, "metadata.parentList": parentList}})
    
        return file;
    }

    this.getFileListByParent = async(userID, parentListString) => {

        const fileList = await conn.db.collection("fs.files")
            .find({"metadata.owner": userID, 
            "metadata.parentList":  {$regex : `.*${parentListString}.*`}}).toArray();
        
        return fileList;
    }

    this.getFileListByOwner = async(userID) => {

        const fileList = await conn.db.collection("fs.files")
                        .find({"metadata.owner": userID}).toArray();

        return fileList;
    }

    this.removeChunksByID = async(fileID) => {

        await conn.db.collection("fs.chunks").deleteMany({files_id: fileID});
    }

}

module.exports = DbUtil;