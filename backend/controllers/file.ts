import { Request, Response } from "express";

//const FileService = require("../services/FileService")
import FileService from "../services/FileService/indexnew";

const fileService = new FileService()


import MongoService from "../services/ChunkService/MongoService";
const mongoService = new MongoService();


import {UserInterface} from "../models/user";

interface RequestType extends Request {
    user?: UserInterface,
    auth?: any,
    busboy?: any,
}

class FileController {

    // fileService: ;

    constructor() {

    }

    getThumbnail = async(req: RequestType, res: Response) => {


        if (!req.user) {

            return;
        }
    
        try {
            
    
            const user = req.user;
            const id = req.params.id;
    
            const decryptedThumbnail = await mongoService.getThumbnail(user, id);
                
            res.send(decryptedThumbnail);
    
        } catch (e) {

            const code = e.code || 500;
            
            console.log(e);
            res.status(code).send();
        }

    }

    async getFullThumbnail(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.params.id;

            await mongoService.getFullThumbnail(user, fileID, res);

        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    async uploadFile(req: RequestType, res: Response) {

        if (!req.user) {
        
            return 
        }
    
        try {

            const user = req.user;
            const busboy = req.busboy;
            
            req.pipe(busboy);
    
            const file = await mongoService.uploadFile(user, busboy, req);
         
            res.send(file);
            
            console.log("file uploaded");
    
        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    async getPublicDownload(req: RequestType, res: Response) {

        try {

            const ID = req.params.id;
            const tempToken = req.params.tempToken;
    
            await mongoService.getPublicDownload(ID, tempToken, res);
    
        } catch (e) {
    
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    async removeLink(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const id = req.params.id;
            const userID = req.user._id;
    
            await fileService.removeLink(userID, id)
    
            res.send();
    
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send();
        }

    }

    async makePublic(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {

            const fileID = req.params.id;
            const user = req.user;
    
            const token = await fileService.makePublic(user, fileID);

            res.send(token);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send();
        }
    }

    async getPublicInfo(req: RequestType, res: Response) {

        try {

            const id = req.params.id;
            const tempToken = req.params.tempToken;
            
            const file = await fileService.getPublicInfo(id, tempToken);

            res.send(file);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async makeOneTimePublic(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const id = req.params.id;
            const userID = req.user._id;
            
            const token = await fileService.makeOneTimePublic(userID, id);

            res.send(token);

        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }

    }

    async getFileInfo(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.params.id;
            const userID = req.user._id;
    
            const file = await fileService.getFileInfo(userID, fileID);
    
            res.send(file);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async getQuickList(req: RequestType, res: Response) { 

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;

            const quickList = await fileService.getQuickList(userID);

            res.send(quickList);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async getList(req: RequestType, res: Response) {

        if (!req.user) {
            return
        }
    
        try {

            const query = req.query;
            const userID = req.user._id;
            
            const fileList = await fileService.getList(userID, query);

            res.send(fileList);
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async getDownloadToken(req: RequestType, res: Response) {

        if (!req.user) {
            return 
        }
    
        try {

            const user = req.user;

            const tempToken = await fileService.getDownloadToken(user);
    
            res.send({tempToken});
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async getDownloadTokenVideo(req: RequestType, res: Response) {

        if (!req.user) {
            return 
        }
    
        try {
    
            const user = req.user;
            const cookie = req.headers.uuid as string;
    
            const tempToken = await fileService.getDownloadTokenVideo(user, cookie);
    
            res.send({tempToken});
    
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async removeTempToken(req: RequestType, res: Response) {

        if (!req.user) {
            return 
        }
    
        try {

            const user = req.user
            const tempToken = req.params.tempToken;
    
            await fileService.removeTempToken(user, tempToken);

            res.send();
            
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
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

    async streamVideo(req: RequestType, res: Response) {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            const user = req.user;
            const fileID = req.params.id;
            const headers = req.headers;
            
            console.log("stream request", req.params.id)
    
            await mongoService.streamVideo(user, fileID, headers, res);
    
        } catch (e) {

            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        }

    }

    async downloadFile(req: RequestType, res: Response) {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            console.log("download request")

            const user = req.user;
            const fileID = req.params.id;

            //await fileService.downloadFile(user, fileID, res);
            await mongoService.downloadFile(user, fileID, res);
    
        } catch (e) {
            
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    async getSuggestedList(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            let searchQuery = req.query.search || "";
    
            const {fileList, folderList} = await fileService.getSuggestedList(userID, searchQuery);
    
            return res.send({folderList, fileList})
    
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async renameFile(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.body.id;
            const title = req.body.title
            const userID = req.user._id;
    
            await fileService.renameFile(userID, fileID, title)

            res.send();
            
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    
    }

    async moveFile(req: RequestType, res: Response) {

        console.log("move request");

        if (!req.user) {
            return;
        }
    
        try {
    
            const fileID = req.body.id;
            const userID = req.user._id;
            const parentID = req.body.parent;
    
            console.log(fileID, userID, parentID);

            await fileService.moveFile(userID, fileID, parentID);

            res.send();
            
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }

    }

    async deleteFile(req: RequestType, res: Response) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const fileID = req.body.id;
    
            await mongoService.deleteFile(userID, fileID);
    
            res.send()
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }
}

export default FileController;
