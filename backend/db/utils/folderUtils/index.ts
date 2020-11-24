import Folder, { FolderInterface } from "../../../models/folder";
import {ObjectID} from "mongodb";

class DbUtil {

    constructor() {

    }

    getFolderSearchList = async(userID: string, searchQuery: RegExp) => {

        let query:any = {"owner": userID, "name": searchQuery};

        const folderList = await Folder.find(query).limit(10) as FolderInterface[];

        return folderList;
    }

    getFolderInfo = async(folderID: string, userID: string) => {

        const folder = await Folder.findOne({"owner": userID, "_id": new ObjectID(folderID)}) as FolderInterface;

        return folder;
    }

    getFolderListByParent = async(userID: string, parent: string, sortBy: string, s3Enabled: boolean, type: string, storageType: string) => {

        let query: any = {"owner": userID, "parent": parent};

        // if (s3Enabled) {
        //     query = {...query, "personalFolder": true}
        // } else if (!s3Enabled) {
        //     query = {...query, "personalFolder": null}
        // }

        // if (type) {
        //     if (type === "mongo") {
        //         query = {...query, "personalFolder": null}
        //     } else if (type === "s3") {
        //         query = {...query, "personalFolder": true}
        //     }
        // }

        // if (storageType === "s3") {
        //     query = {...query, "personalFolder": true}
        // }

        const folderList = await Folder.find(query)
        .sort(sortBy) as FolderInterface[];

        return folderList;
    }

    getFolderListBySearch = async(userID: string, searchQuery: string, sortBy: string, type: string, parent: string, storageType: string, folderSearch: boolean) => {

        let query: any = {"name": searchQuery,"owner": userID};

        if (type) {
            if (type === "mongo") {
                query = {...query, "personalFolder": null}
                console.log("mongo query", query)
            } else  {
                query = {...query, "personalFolder": true}
            }
        }

        if (storageType === "s3") {
            query = {...query, "personalFolder": true}
        }

        if (parent && (parent !== "/" || folderSearch)) {
            query = {...query, parent}
        }

        const folderList = await Folder.find(query)
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