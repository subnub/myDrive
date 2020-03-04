const Folder = require("../../../models/folder");
const ObjectID = require('mongodb').ObjectID

const DbUtil = function() {

    this.getFolderSearchList = async(userID, searchQuery) => {

        const folderList = await Folder.find({"owner": userID, "name": searchQuery}).limit(10);

        return folderList;
    }

    this.getFolderInfo = async(folderID, userID) => {

        const folder = await Folder.findOne({"owner": userID, "_id": ObjectID(folderID)});

        return folder;
    }

    this.getFolderListByParent = async(userID, parent, sortBy) => {

        const folderList = await Folder.find({"owner": userID, "parent": parent})
        .sort(sortBy);

        return folderList;
    }

    this.getFolderListBySearch = async(userID, searchQuery, sortBy) => {

        const folderList = await Folder.find({"name": searchQuery,"owner": userID})
            .sort(sortBy);

        return folderList;
    }

    this.moveFolder = async(folderID, userID, parent, parentList) => {

        const folder = await Folder.findOneAndUpdate({"_id": ObjectID(folderID), 
        "owner": userID}, {"$set": {"parent": parent, "parentList": parentList}});

        return folder;
    }

    this.renameFolder = async(folderID, userID, title) => {

        const folder = await Folder.findOneAndUpdate({"_id": ObjectID(folderID), 
        "owner": userID}, {"$set": {"name": title}});

        return folder;
    }

    this.findAllFoldersByParent = async(parentID, userID) => {

        const folderList = await Folder.find({"parentList": parentID, "owner": userID});

        return folderList;

    }
}

module.exports = DbUtil;