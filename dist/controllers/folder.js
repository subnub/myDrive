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
Object.defineProperty(exports, "__esModule", { value: true });
const FolderService = require("../services/FolderService");
const folderService = new FolderService();
class FolderController {
    constructor() {
    }
    uploadFolder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const data = req.body;
                const folder = yield folderService.uploadFolder(data);
                res.send(folder);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    deleteFolder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const parentList = req.body.parentList;
                yield folderService.deleteFolder(userID, folderID, parentList);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    deleteAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                yield folderService.deleteAll(userID);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    getInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.params.id;
                const folder = yield folderService.getFolderInfo(userID, folderID);
                res.send(folder);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    getSubfolderList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.query.id;
                const { folderIDList, folderNameList } = yield folderService.getFolderSublist(userID, folderID);
                res.send({ folderIDList, folderNameList });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    getFolderList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const query = req.query;
                const folderList = yield folderService.getFolderList(userID, query);
                res.send(folderList);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    moveFolder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const parent = req.body.parent;
                yield folderService.moveFolder(userID, folderID, parent);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
    renameFolder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const title = req.body.title;
                yield folderService.renameFolder(userID, folderID, title);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send(e);
            }
        });
    }
}
module.exports = FolderController;
