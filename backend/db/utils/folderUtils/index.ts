import Folder, { FolderInterface } from "../../../models/folder";
import {ObjectID} from "mongodb";

class DbUtil {

    constructor() {

    }

    getFolderSearchList = async(userID: string, searchQuery: RegExp) => {

        const folderList = await Folder.find({"owner": userID, "name": searchQuery}).limit(10) as FolderInterface[];

        return folderList;
    }

    getFolderInfo = async(folderID: string, userID: string) => {

        const folder = await Folder.findOne({"owner": userID, "_id": new ObjectID(folderID)}) as FolderInterface;

        return folder;
    }

    getFolderListByParent = async(userID: string, parent: string, sortBy: string) => {

        const folderList = await Folder.find({"owner": userID, "parent": parent})
        .sort(sortBy) as FolderInterface[];

        return folderList;
    }

    getFolderListBySearch = async(userID: string, searchQuery: string, sortBy: string) => {

        const folderList = await Folder.find({"name": searchQuery,"owner": userID})
            .sort(sortBy) as FolderInterface[];

        return folderList;
    }

    moveFolder = async(folderID: string, userID: string, parent: string, parentList: string[]) => {

        const folder = await Folder.findOneAndUpdate({"_id": new ObjectID(folderID), 
        "owner": userID}, {"$set": {"parent": parent, "parentList": parentList}}) as FolderInterface;

        return folder;
    }

    renameFolder = async(folderID: string, userID: string, title: string) => {

        const folder = await Folder.findOneAndUpdate({"_id": new ObjectID(folderID), 
        "owner": userID}, {"$set": {"name": title}}) as FolderInterface;

        return folder;
    }

    findAllFoldersByParent = async(parentID: string, userID: string) => {

        const folderList = await Folder.find({"parentList": parentID, "owner": userID}) as FolderInterface[];

        return folderList;
    }
}

export default DbUtil;