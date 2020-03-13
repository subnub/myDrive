const FolderService = require("../services/FolderService");
const folderService = new FolderService();

class FolderController {

    constructor() {

    }

    async uploadFolder(req, res) {

        if (!req.user) {

            return 
        }
    
        try {

            const data = req.body;

            const folder = await folderService.uploadFolder(data);

            res.send(folder);
    
        } catch (e) {

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async deleteFolder(req, res) {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.body.id; 
            const parentList = req.body.parentList

            await folderService.deleteFolder(userID, folderID, parentList);
    
            res.send();

        } catch (e) {
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async deleteAll(req, res) {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;

            await folderService.deleteAll(userID);

            res.send();

        } catch (e) {
           
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async getInfo(req, res) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.params.id;
    
            const folder = await folderService.getFolderInfo(userID, folderID);
    
            res.send(folder);
    
        } catch (e) {

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async getSubfolderList(req, res) {

        if (!req.user) {

            return
        } 
    
        try {
    
            const userID = req.user._id;
            const folderID = req.query.id;
            
            const {folderIDList, folderNameList} = await folderService.getFolderSublist(userID, folderID);
            
            res.send({folderIDList, folderNameList})    
    
        } catch (e) {
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async getFolderList(req, res) {

        if (!req.user) {

            return 
        }
    
        try {
    
            const userID = req.user._id;
            const query = req.query;

            const folderList = await folderService.getFolderList(userID, query);

            res.send(folderList);

        } catch (e) {
            
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
        }
    }

    async moveFolder(req, res) {

        if (!req.user) {
            return;
        }

        try {

            const userID = req.user._id;
            const folderID = req.body.id;
            const parent = req.body.parent;

            await folderService.moveFolder(userID, folderID, parent);

            res.send();

        } catch (e) {

            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);

        }
    }

    async renameFolder(req, res) {

        if (!req.user) {
            return;
        }
    
        try {
    
            const userID = req.user._id;
            const folderID = req.body.id;
            const title = req.body.title
    
            await folderService.renameFolder(userID, folderID, title);
    
            res.send()
            
        } catch (e) {
    
            const code = e.code || 500

            console.log(e);
            res.status(code).send(e);
    
        }
    }
}

module.exports = FolderController;