const Folder = require("../../models/folder");
const InternalServerError = require("../../utils/InternalServerError");
const NotFoundError = require("../../utils/NotFoundError");
const UtilsFile = require("../../db/utils/fileUtils");
const ObjectID = require('mongodb').ObjectID
const UtilsFolder = require("../../db/utils/folderUtils");
const mongoose = require("../../db/mongoose")
const conn = mongoose.connection;
const Thumbnail = require("../../models/thumbnail");
const sortBySwitch = require("../../utils/sortBySwitchFolder")

const utilsFile = new UtilsFile();
const utilsFolder = new UtilsFolder();

const FolderService = function() {

    this.uploadFolder = async(data) => {

        const folder = new Folder(data);
    
        await folder.save();

        if (!folder) throw new InternalServerError("Upload Folder Error");

        return folder;
    }
    
    this.deleteFolder = async(userID, folderID, parentList) => {

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });

        const videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });

        const parentListString = parentList.toString()
    
        await Folder.deleteMany({"owner": userID, "parentList": { $all: parentList}})
        await Folder.deleteMany({"owner": userID, "_id": folderID});

        const fileList = await utilsFile.getFileListByParent(userID, parentListString);
    
        if (!fileList) throw new NotFoundError("Delete File List Not Found");
        
        for (let i = 0; i < fileList.length; i++) {

            const currentFile = fileList[i];

            try {
                
                if (currentFile.metadata.thumbnailID) {
                    
                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID});
                }
                    
                if (currentFile.metadata.isVideo && currentFile.metadata.transcoded) {
                    
                    try {
                        await videoBucket.delete(ObjectID(currentFile.metadata.transcodedID))
                    } catch (e) {console.log("Could Not Find Transcoded Video")}
                    
                }
                    
                await bucket.delete(ObjectID(currentFile._id));   

            } catch (e) {

                console.log("Could not delete file", currentFile.filename, currentFile._id);
            }
            
           
        }        
    }

    this.deleteAll = async(userID) => {
        
        console.log("remove all request")

        let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });

        const videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: "videos"
        });

        await Folder.deleteMany({"owner": userID});

        const fileList = await utilsFile.getFileListByOwner(userID);

        if (!fileList) throw new NotFoundError("Delete All File List Not Found Error");

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];

            try {

                if (currentFile.metadata.thumbnailID) {

                    await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID})
                }
    
                if (currentFile.metadata.isVideo && currentFile.metadata.transcoded) {
    
                    try {
                        await videoBucket.delete(ObjectID(currentFile.metadata.transcodedID))
                    } catch (e) {
                        console.log("Cannot Find Transcoded Video");
                    }
                    
                }
    
                await bucket.delete(ObjectID(currentFile._id));

            } catch (e) {

                console.log("Could Not Remove File", currentFile.filename, currentFile._id);
            }
        }

    }

    this.getFolderInfo = async(userID, folderID) => {

        let currentFolder = await utilsFolder.getFolderInfo(folderID, userID);
    
        if (!currentFolder) throw new NotFoundError("Folder Info Not Found Error");
    
        const parentID = currentFolder.parent;
    
        let parentName = ""; 
    
        if (parentID === "/") {
    
            parentName = "Home"
    
        } else {
    
            const parentFolder = await utilsFolder.getFolderInfo(parentID, userID);
                
            if (parentFolder) {
    
                parentName = parentFolder.name;
    
            } else {
    
                parentName = "Unknown"
            }
    
        }
    
        const folderName = currentFolder.name
    
        currentFolder = {...currentFolder._doc, parentName, folderName}
        // Must Use ._doc here, or the destucturing/spreading 
        // Will add a bunch of unneeded variables to the object.

        return currentFolder;
    }

    this.getFolderSublist = async(userID, folderID) => {
        
        const folder = await utilsFolder.getFolderInfo(folderID, userID);

        if (!folder) throw new NotFoundError("Folder Sublist Not Found Error");
    
        const subfolderList = folder.parentList;

        let folderIDList = [];
        let folderNameList = [];

        for (let i = 0; i < subfolderList.length; i++) {

            const currentSubFolderID = subfolderList[i];

            if (currentSubFolderID === "/") {

                folderIDList.push("/");
                folderNameList.push("Home")

            } else {

                const currentFolder = await utilsFolder.getFolderInfo(currentSubFolderID, userID);

                folderIDList.push(currentFolder._id);
                folderNameList.push(currentFolder.name)
            }   
        }

        folderIDList.push(folderID);
        folderNameList.push(folder.name)

        return {
            folderIDList, 
            folderNameList
        }

    }

    this.getFolderList = async(userID, query) => {

        let searchQuery = query.search || "";
        const parent = query.parent || "/";
        let sortBy = query.sortby || "DEFAULT"
        sortBy = sortBySwitch(sortBy)

        if (searchQuery.length === 0) {

            const folderList = await utilsFolder.getFolderListByParent(userID, parent, sortBy);

            if (!folderList) throw new NotFoundError("Folder List Not Found Error");

            return folderList;

        } else {

            searchQuery = new RegExp(searchQuery, 'i')
            const folderList = await utilsFolder.getFolderListBySearch(userID, searchQuery, sortBy);

            if (!folderList) throw new NotFoundError("Folder List Not Found Error");

            return folderList;
        }
    }

    this.renameFolder = async(userID, folderID, title) => {

        const folder = await utilsFolder.renameFolder(folderID, userID, title);

        if (!folder) throw new NotFoundError("Rename Folder Not Found");
    }

    this.moveFolder = async(userID, folderID, parentID) => {

        let parentList = ["/"];

        if (parentID.length !== 1) {

            const parentFile = await utilsFolder.getFolderInfo(parentID, userID);
            parentList = parentFile.parentList;
            parentList.push(parentID);
        }

        const folder = await utilsFolder.moveFolder(folderID, userID, parentID, parentList);

        if (!folder) throw new NotFoundError("Move Folder Not Found")

        const folderChilden = await utilsFolder.findAllFoldersByParent(folderID.toString(), userID);

        folderChilden.map( async(currentFolderChild) => {

            let currentFolderChildParentList = currentFolderChild.parentList;

            const indexOfFolderID = currentFolderChildParentList.indexOf(folderID.toString());

            currentFolderChildParentList = currentFolderChildParentList.splice(indexOfFolderID);

            currentFolderChildParentList = [...parentList, ...currentFolderChildParentList];

            currentFolderChild.parentList = currentFolderChildParentList;

            await currentFolderChild.save()
        })

        const fileChildren = await utilsFile.getFileListByParent(userID, folderID.toString());

        fileChildren.map( async(currentFileChild) => {

            let currentFileChildParentList = currentFileChild.metadata.parentList;

            currentFileChildParentList = currentFileChildParentList.split(",");

            const indexOfFolderID = currentFileChildParentList.indexOf(folderID.toString());

            currentFileChildParentList = currentFileChildParentList.splice(indexOfFolderID);

            currentFileChildParentList = [...parentList, ...currentFileChildParentList];

            await utilsFile.moveFile(currentFileChild._id, userID, currentFileChild.metadata.parent, currentFileChildParentList.toString())

        })
    }
}

module.exports = FolderService;