"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("../../mongoose");
const conn = mongoose.connection;
const ObjectID = require('mongodb').ObjectID;
const DbUtil = function () {
    this.getPublicFile = (fileID) => __awaiter(this, void 0, void 0, function* () {
        let file = yield conn.db.collection("fs.files")
            .findOne({ "_id": ObjectID(fileID) });
        return file;
    });
    this.removeOneTimePublicLink = (fileID) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID) }, {
            "$unset": { "metadata.linkType": "", "metadata.link": "" }
        });
        return file;
    });
    this.removeLink = (fileID, userID) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID),
            "metadata.owner": userID }, { "$unset": { "metadata.linkType": "", "metadata.link": "" } });
        return file;
    });
    this.makePublic = (fileID, userID, token) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID),
            "metadata.owner": userID }, { "$set": { "metadata.linkType": "public", "metadata.link": token } });
        return file;
    });
    this.getPublicInfo = (fileID, tempToken) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOne({ "_id": ObjectID(fileID), "metadata.link": tempToken });
        return file;
    });
    this.makeOneTimePublic = (fileID, userID, token) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID),
            "metadata.owner": userID }, { "$set": { "metadata.linkType": "one", "metadata.link": token } });
        return file;
    });
    this.getFileInfo = (fileID, userID) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOne({ "metadata.owner": userID, "_id": ObjectID(fileID) });
        return file;
    });
    this.getQuickList = (userID) => __awaiter(this, void 0, void 0, function* () {
        const fileList = yield conn.db.collection("fs.files")
            .find({ "metadata.owner": userID })
            .sort({ uploadDate: -1 })
            .limit(10)
            .toArray();
        return fileList;
    });
    this.getList = (queryObj, sortBy, limit) => __awaiter(this, void 0, void 0, function* () {
        const fileList = yield conn.db.collection("fs.files")
            .find(queryObj)
            .sort(sortBy)
            .limit(limit)
            .toArray();
        return fileList;
    });
    this.removeTempToken = (user, tempToken) => __awaiter(this, void 0, void 0, function* () {
        user.tempTokens = user.tempTokens.filter((filterToken) => {
            return filterToken.token !== tempToken;
        });
        return user;
    });
    this.removeTranscodeVideo = (fileID, userID) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID), "metadata.owner": userID }, { "$unset": { "metadata.transcoded": "", "metadata.transcodedIV": "",
                "metadata.transcoded_size": "", "metadata.transcodedID": "" } });
        return file;
    });
    this.getFileSearchList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
        const fileList = yield conn.db.collection("fs.files")
            .find({ "metadata.owner": userID, "filename": searchQuery })
            .limit(10)
            .toArray();
        return fileList;
    });
    this.renameFile = (fileID, userID, title) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID),
            "metadata.owner": userID }, { "$set": { "filename": title } });
        return file;
    });
    this.moveFile = (fileID, userID, parent, parentList) => __awaiter(this, void 0, void 0, function* () {
        const file = yield conn.db.collection("fs.files")
            .findOneAndUpdate({ "_id": ObjectID(fileID),
            "metadata.owner": userID }, { "$set": { "metadata.parent": parent, "metadata.parentList": parentList } });
        return file;
    });
    this.getFileListByParent = (userID, parentListString) => __awaiter(this, void 0, void 0, function* () {
        const fileList = yield conn.db.collection("fs.files")
            .find({ "metadata.owner": userID,
            "metadata.parentList": { $regex: `.*${parentListString}.*` } }).toArray();
        return fileList;
    });
    this.getFileListByOwner = (userID) => __awaiter(this, void 0, void 0, function* () {
        const fileList = yield conn.db.collection("fs.files")
            .find({ "metadata.owner": userID }).toArray();
        return fileList;
    });
    this.removeChunksByID = (fileID) => __awaiter(this, void 0, void 0, function* () {
        yield conn.db.collection("fs.chunks").deleteMany({ files_id: fileID });
    });
};
module.exports = DbUtil;
