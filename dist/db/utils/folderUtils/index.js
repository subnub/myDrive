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
const Folder = require("../../../models/folder");
const ObjectID = require('mongodb').ObjectID;
const DbUtil = function () {
    this.getFolderSearchList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
        const folderList = yield Folder.find({ "owner": userID, "name": searchQuery }).limit(10);
        return folderList;
    });
    this.getFolderInfo = (folderID, userID) => __awaiter(this, void 0, void 0, function* () {
        const folder = yield Folder.findOne({ "owner": userID, "_id": ObjectID(folderID) });
        return folder;
    });
    this.getFolderListByParent = (userID, parent, sortBy) => __awaiter(this, void 0, void 0, function* () {
        const folderList = yield Folder.find({ "owner": userID, "parent": parent })
            .sort(sortBy);
        return folderList;
    });
    this.getFolderListBySearch = (userID, searchQuery, sortBy) => __awaiter(this, void 0, void 0, function* () {
        const folderList = yield Folder.find({ "name": searchQuery, "owner": userID })
            .sort(sortBy);
        return folderList;
    });
    this.moveFolder = (folderID, userID, parent, parentList) => __awaiter(this, void 0, void 0, function* () {
        const folder = yield Folder.findOneAndUpdate({ "_id": ObjectID(folderID),
            "owner": userID }, { "$set": { "parent": parent, "parentList": parentList } });
        return folder;
    });
    this.renameFolder = (folderID, userID, title) => __awaiter(this, void 0, void 0, function* () {
        const folder = yield Folder.findOneAndUpdate({ "_id": ObjectID(folderID),
            "owner": userID }, { "$set": { "name": title } });
        return folder;
    });
    this.findAllFoldersByParent = (parentID, userID) => __awaiter(this, void 0, void 0, function* () {
        const folderList = yield Folder.find({ "parentList": parentID, "owner": userID });
        return folderList;
    });
};
module.exports = DbUtil;
