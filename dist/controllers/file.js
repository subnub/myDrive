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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//const FileService = require("../services/FileService")
const indexnew_1 = __importDefault(require("../services/FileService/indexnew"));
const fileService = new indexnew_1.default();
const MongoService_1 = __importDefault(require("../services/ChunkService/MongoService"));
const mongoService = new MongoService_1.default();
class FileController {
    // fileService: ;
    constructor() {
        this.getThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const id = req.params.id;
                const decryptedThumbnail = yield mongoService.getThumbnail(user, id);
                res.send(decryptedThumbnail);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getFullThumbnail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield mongoService.getFullThumbnail(user, fileID, res);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e.message, e.exception);
                return res.status(code).send();
            }
        });
    }
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const busboy = req.busboy;
                req.pipe(busboy);
                const file = yield mongoService.uploadFile(user, busboy, req);
                res.send(file);
                console.log("file uploaded");
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e.message, e.exception);
                return res.status(code).send();
            }
        });
    }
    getPublicDownload(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ID = req.params.id;
                const tempToken = req.params.tempToken;
                yield mongoService.getPublicDownload(ID, tempToken, res);
            }
            catch (e) {
                const code = e.code || 500;
                const message = e.message || e;
                console.log(message, e);
                res.status(code).send();
            }
        });
    }
    removeLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const id = req.params.id;
                const userID = req.user._id;
                yield fileService.removeLink(userID, id);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    makePublic(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.params.id;
                const user = req.user;
                const token = yield fileService.makePublic(user, fileID);
                res.send(token);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getPublicInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const tempToken = req.params.tempToken;
                const file = yield fileService.getPublicInfo(id, tempToken);
                res.send(file);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    makeOneTimePublic(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const id = req.params.id;
                const userID = req.user._id;
                const token = yield fileService.makeOneTimePublic(userID, id);
                res.send(token);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getFileInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.params.id;
                const userID = req.user._id;
                const file = yield fileService.getFileInfo(userID, fileID);
                res.send(file);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getQuickList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const quickList = yield fileService.getQuickList(userID);
                res.send(quickList);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const query = req.query;
                const userID = req.user._id;
                const fileList = yield fileService.getList(userID, query);
                res.send(fileList);
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getDownloadToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const tempToken = yield fileService.getDownloadToken(user);
                res.send({ tempToken });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    getDownloadTokenVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const cookie = req.headers.uuid;
                const tempToken = yield fileService.getDownloadTokenVideo(user, cookie);
                res.send({ tempToken });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    removeTempToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const tempToken = req.params.tempToken;
                yield fileService.removeTempToken(user, tempToken);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    // async transcodeVideo(req: RequestType, res: Response) {
    //     if (!req.user) {
    //         return;
    //     }
    //     try {
    //         console.log("transcode request", req.body.file._id)
    //         const user = req.user;
    //         const body = req.body;
    //         await fileService.transcodeVideo(user, body);
    //         res.send("Finished");
    //     } catch (e) {
    //         const code = e.code || 500;
    //         console.log(e.message, e.exception)
    //         return res.status(code).send();
    //     }
    // }
    // async removeTranscodeVideo(req: RequestType, res: Response) {
    //     if (!req.user) {
    //         return;
    //     }
    //     try {
    //         const fileID = req.body.id;
    //         const userID = req.user._id;
    //         await fileService.removeTranscodeVideo(userID, fileID);
    //         res.send();
    //     } catch (e) {
    //         const code = e.code || 500;
    //         console.log(e);
    //         res.status(code).send()
    //     }
    // }
    // async streamTranscodedVideo(req: RequestType, res: Response) {
    //     if (!req.auth || !req.user) {
    //         return;
    //     }
    //     try {
    //         console.log("stream request transcoded", req.params.id)
    //         const fileID = req.params.id;
    //         const userID = req.user._id;
    //         const headers = req.headers;
    //         await fileService.streamTranscodedVideo(userID, fileID, headers, res);
    //     } catch (e) {
    //         const code = e.code || 500;
    //         const message = e.message || e;
    //         console.log(message, e);
    //         res.status(code).send();
    //     }
    // }
    streamVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.auth || !req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                const headers = req.headers;
                console.log("stream request", req.params.id);
                yield mongoService.streamVideo(user, fileID, headers, res);
            }
            catch (e) {
                const code = e.code || 500;
                const message = e.message || e;
                console.log(message, e);
                res.status(code).send();
            }
        });
    }
    downloadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.auth || !req.user) {
                return;
            }
            try {
                console.log("download request");
                const user = req.user;
                const fileID = req.params.id;
                //await fileService.downloadFile(user, fileID, res);
                yield mongoService.downloadFile(user, fileID, res);
            }
            catch (e) {
                const code = e.code || 500;
                const message = e.message || e;
                console.log(message, e);
                res.status(code).send();
            }
        });
    }
    getSuggestedList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                let searchQuery = req.query.search || "";
                const { fileList, folderList } = yield fileService.getSuggestedList(userID, searchQuery);
                return res.send({ folderList, fileList });
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    renameFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.body.id;
                const title = req.body.title;
                const userID = req.user._id;
                yield fileService.renameFile(userID, fileID, title);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    moveFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("move request");
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.body.id;
                const userID = req.user._id;
                const parentID = req.body.parent;
                console.log(fileID, userID, parentID);
                yield fileService.moveFile(userID, fileID, parentID);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
    deleteFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const fileID = req.body.id;
                yield fileService.deleteFile(userID, fileID);
                res.send();
            }
            catch (e) {
                const code = e.code || 500;
                console.log(e);
                res.status(code).send();
            }
        });
    }
}
exports.default = FileController;
