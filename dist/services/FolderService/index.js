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
const Folder = require("../../models/folder");
const InternalServerError = require("../../utils/InternalServerError");
const NotFoundError = require("../../utils/NotFoundError");
const UtilsFile = require("../../db/utils/fileUtils");
const ObjectID = require('mongodb').ObjectID;
const UtilsFolder = require("../../db/utils/folderUtils");
const mongoose = require("../../db/mongoose");
const conn = mongoose.connection;
const Thumbnail = require("../../models/thumbnail");
const sortBySwitch = require("../../utils/sortBySwitchFolder");
const utilsFile = new UtilsFile();
const utilsFolder = new UtilsFolder();
const FolderService = function () {
    this.uploadFolder = (data) => __awaiter(this, void 0, void 0, function* () {
        const folder = new Folder(data);
        yield folder.save();
        if (!folder)
            throw new InternalServerError("Upload Folder Error");
        return folder;
    });
    this.deleteFolder = (userID, folderID, parentList) => __awaiter(this, void 0, void 0, function* () {
        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });
        const videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });
        const parentListString = parentList.toString();
        yield Folder.deleteMany({ "owner": userID, "parentList": { $all: parentList } });
        yield Folder.deleteMany({ "owner": userID, "_id": folderID });
        const fileList = yield utilsFile.getFileListByParent(userID, parentListString);
        if (!fileList)
            throw new NotFoundError("Delete File List Not Found");
        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];
            try {
                if (currentFile.metadata.thumbnailID) {
                    yield Thumbnail.deleteOne({ _id: currentFile.metadata.thumbnailID });
                }
                if (currentFile.metadata.isVideo && currentFile.metadata.transcoded) {
                    try {
                        yield videoBucket.delete(ObjectID(currentFile.metadata.transcodedID));
                    }
                    catch (e) {
                        console.log("Could Not Find Transcoded Video");
                    }
                }
                yield bucket.delete(ObjectID(currentFile._id));
            }
            catch (e) {
                console.log("Could not delete file", currentFile.filename, currentFile._id);
            }
        }
    });
    this.deleteAll = (userID) => __awaiter(this, void 0, void 0, function* () {
        console.log("remove all request");
        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });
        const videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });
        yield Folder.deleteMany({ "owner": userID });
        const fileList = yield utilsFile.getFileListByOwner(userID);
        if (!fileList)
            throw new NotFoundError("Delete All File List Not Found Error");
        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];
            try {
                if (currentFile.metadata.thumbnailID) {
                    yield Thumbnail.deleteOne({ _id: currentFile.metadata.thumbnailID });
                }
                if (currentFile.metadata.isVideo && currentFile.metadata.transcoded) {
                    try {
                        yield videoBucket.delete(ObjectID(currentFile.metadata.transcodedID));
                    }
                    catch (e) {
                        console.log("Cannot Find Transcoded Video");
                    }
                }
                yield bucket.delete(ObjectID(currentFile._id));
            }
            catch (e) {
                console.log("Could Not Remove File", currentFile.filename, currentFile._id);
            }
        }
    });
    this.getFolderInfo = (userID, folderID) => __awaiter(this, void 0, void 0, function* () {
        let currentFolder = yield utilsFolder.getFolderInfo(folderID, userID);
        if (!currentFolder)
            throw new NotFoundError("Folder Info Not Found Error");
        const parentID = currentFolder.parent;
        let parentName = "";
        if (parentID === "/") {
            parentName = "Home";
        }
        else {
            const parentFolder = yield utilsFolder.getFolderInfo(parentID, userID);
            if (parentFolder) {
                parentName = parentFolder.name;
            }
            else {
                parentName = "Unknown";
            }
        }
        const folderName = currentFolder.name;
        currentFolder = Object.assign(Object.assign({}, currentFolder._doc), { parentName, folderName });
        // Must Use ._doc here, or the destucturing/spreading 
        // Will add a bunch of unneeded variables to the object.
        return currentFolder;
    });
    this.getFolderSublist = (userID, folderID) => __awaiter(this, void 0, void 0, function* () {
        const folder = yield utilsFolder.getFolderInfo(folderID, userID);
        if (!folder)
            throw new NotFoundError("Folder Sublist Not Found Error");
        const subfolderList = folder.parentList;
        let folderIDList = [];
        let folderNameList = [];
        for (let i = 0; i < subfolderList.length; i++) {
            const currentSubFolderID = subfolderList[i];
            if (currentSubFolderID === "/") {
                folderIDList.push("/");
                folderNameList.push("Home");
            }
            else {
                const currentFolder = yield utilsFolder.getFolderInfo(currentSubFolderID, userID);
                folderIDList.push(currentFolder._id);
                folderNameList.push(currentFolder.name);
            }
        }
        folderIDList.push(folderID);
        folderNameList.push(folder.name);
        return {
            folderIDList,
            folderNameList
        };
    });
    this.getFolderList = (userID, query) => __awaiter(this, void 0, void 0, function* () {
        let searchQuery = query.search || "";
        const parent = query.parent || "/";
        let sortBy = query.sortby || "DEFAULT";
        sortBy = sortBySwitch(sortBy);
        if (searchQuery.length === 0) {
            const folderList = yield utilsFolder.getFolderListByParent(userID, parent, sortBy);
            if (!folderList)
                throw new NotFoundError("Folder List Not Found Error");
            return folderList;
        }
        else {
            searchQuery = new RegExp(searchQuery, 'i');
            const folderList = yield utilsFolder.getFolderListBySearch(userID, searchQuery, sortBy);
            if (!folderList)
                throw new NotFoundError("Folder List Not Found Error");
            return folderList;
        }
    });
    this.renameFolder = (userID, folderID, title) => __awaiter(this, void 0, void 0, function* () {
        const folder = yield utilsFolder.renameFolder(folderID, userID, title);
        if (!folder)
            throw new NotFoundError("Rename Folder Not Found");
    });
    this.moveFolder = (userID, folderID, parentID) => __awaiter(this, void 0, void 0, function* () {
        let parentList = ["/"];
        if (parentID.length !== 1) {
            const parentFile = yield utilsFolder.getFolderInfo(parentID, userID);
            parentList = parentFile.parentList;
            parentList.push(parentID);
        }
        const folder = yield utilsFolder.moveFolder(folderID, userID, parentID, parentList);
        if (!folder)
            throw new NotFoundError("Move Folder Not Found");
        const folderChilden = yield utilsFolder.findAllFoldersByParent(folderID.toString(), userID);
        folderChilden.map((currentFolderChild) => __awaiter(this, void 0, void 0, function* () {
            let currentFolderChildParentList = currentFolderChild.parentList;
            const indexOfFolderID = currentFolderChildParentList.indexOf(folderID.toString());
            currentFolderChildParentList = currentFolderChildParentList.splice(indexOfFolderID);
            currentFolderChildParentList = [...parentList, ...currentFolderChildParentList];
            currentFolderChild.parentList = currentFolderChildParentList;
            yield currentFolderChild.save();
        }));
        const fileChildren = yield utilsFile.getFileListByParent(userID, folderID.toString());
        fileChildren.map((currentFileChild) => __awaiter(this, void 0, void 0, function* () {
            let currentFileChildParentList = currentFileChild.metadata.parentList;
            currentFileChildParentList = currentFileChildParentList.split(",");
            const indexOfFolderID = currentFileChildParentList.indexOf(folderID.toString());
            currentFileChildParentList = currentFileChildParentList.splice(indexOfFolderID);
            currentFileChildParentList = [...parentList, ...currentFileChildParentList];
            yield utilsFile.moveFile(currentFileChild._id, userID, currentFileChild.metadata.parent, currentFileChildParentList.toString());
        }));
    });
};
module.exports = FolderService;
