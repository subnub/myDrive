const FileService = require("../services/FileService")

const fileService = new FileService()

class FileController {

    constructor() {

    }


    async getThumbnail(req, res) {

        if (!req.user) {

            return;
        }
    
        try {
    
            const user = req.user;
            const id = req.params.id;
    
            const decryptedThumbnail = await fileService.getThumbnail(user, id);
                
            res.send(decryptedThumbnail);
    
        } catch (e) {

            const code = e.code || 500;
            
            console.log(e);
            res.status(code).send();
        }

    }

    async getFullThumbnail(req, res) {

        if (!req.user) {
            return;
        }

        try {

            const user = req.user;
            const fileID = req.params.id;

            await fileService.getFullThumbnail(user, fileID, res);

        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    async uploadFile(req, res) {

        if (!req.user) {
        
            return 
        }
    
        try {

            const user = req.user;
            const busboy = req.busboy;
            
            req.pipe(busboy);
    
            const file = await fileService.upload(user, busboy, req);
         
            res.send(file);
            
            console.log("file uploaded");
    
        } catch (e) {
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    async getPublicDownload(req, res) {

        try {

            const ID = req.params.id;
            const tempToken = req.params.tempToken;
    
            await fileService.publicDownload(ID, tempToken, res);
    
        } catch (e) {
    
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    async removeLink(req, res) {

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

    async makePublic(req, res) {

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

    async getPublicInfo(req, res) {

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

    async makeOneTimePublic(req, res) {

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

    async getFileInfo(req, res) {

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

    async getQuickList(req, res) { 

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

    async getList(req, res) {

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

    async getDownloadToken(req, res) {

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

    async getDownloadTokenVideo(req, res) {

        if (!req.user) {
            return 
        }
    
        try {
    
            const user = req.user;
            const cookie = req.headers.uuid
    
            const tempToken = await fileService.getDownloadTokenVideo(user, cookie);
    
            res.send({tempToken});
    
        } catch (e) {

            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async removeTempToken(req, res) {

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

    async transcodeVideo(req, res) {

        if (!req.user) {

            return;
        }
    
        try {
    
            console.log("transcode request", req.body.file._id)

            const user = req.user;
            const body = req.body;
    
            await fileService.transcodeVideo(user, body);

            res.send("Finished");
    
        } catch (e) {
            
            const code = e.code || 500;
            console.log(e.message, e.exception)
            return res.status(code).send();
        }
    }

    async removeTranscodeVideo(req, res) {

        if (!req.user) {

            return;
        }
    
        try {
    
            const fileID = req.body.id;
            const userID = req.user._id;
                
            await fileService.removeTranscodeVideo(userID, fileID);

            res.send();
    
        } catch (e) {
    
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }

    async streamTranscodedVideo(req, res) {
        
        if (!req.auth || !req.user) {
            return;
        }

        try {

            console.log("stream request transcoded", req.params.id)

            const fileID = req.params.id;
            const userID = req.user._id;
            const headers = req.headers;

            await fileService.streamTranscodedVideo(userID, fileID, headers, res);

        } catch (e) {
            
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        }
    }

    async streamVideo(req, res) {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            const user = req.user;
            const fileID = req.params.id;
            const headers = req.headers;
            
            console.log("stream request", req.params.id)
    
            await fileService.streamVideo(user, fileID, headers, res);
    
        } catch (e) {

            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        }

    }

    async downloadFile(req, res) {

        if (!req.auth || !req.user) {
            return;
        }
    
        try {
    
            console.log("download request")

            const user = req.user;
            const fileID = req.params.id;

            await fileService.downloadFile(user, fileID, res);
    
        } catch (e) {
            
            const code = e.code || 500;
            const message = e.message || e;

            console.log(message, e);
            res.status(code).send();
        } 
    }

    async getSuggestedList(req, res) {

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

    async renameFile(req, res) {

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

    async moveFile(req, res) {

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

    async deleteFile(req, res) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const fileID = req.body.id;
    
            await fileService.deleteFile(userID, fileID);
    
            res.send()
    
        } catch (e) {
            
            const code = e.code || 500;

            console.log(e);
            res.status(code).send()
        }
    }
}

module.exports = FileController;
