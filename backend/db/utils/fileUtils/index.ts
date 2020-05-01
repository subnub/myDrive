import mongoose from "../../mongoose";
import {ObjectID} from "mongodb";
import {FileInterface} from "../../../models/file";
import {UserInterface} from "../../../models/user";
import { QueryInterface } from "../../../utils/createQuery";
const conn = mongoose.connection;

class DbUtil {

    constructor() {

    }

    getPublicFile = async(fileID: string) => {

        let file = await conn.db.collection("fs.files")
        .findOne({"_id": new ObjectID(fileID)}) as FileInterface;

        return file;
    }

    removeOneTimePublicLink = async(fileID: string) => {

        const file = await conn.db.collection("fs.files")
                .findOneAndUpdate({"_id": new ObjectID(fileID)}, {
                    "$unset": {"metadata.linkType": "", "metadata.link": ""}}) as FileInterface;

        return file;
    }

    removeLink = async(fileID: string, userID: string) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": new ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$unset": {"metadata.linkType": "", "metadata.link": ""}}) as FileInterface;

        return file;
    }

    makePublic = async(fileID: string, userID: string, token: string) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": new ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "public", "metadata.link": token}}) as FileInterface

        return file;
    }

    getPublicInfo = async(fileID: string, tempToken: string) => {

        const file = await conn.db.collection("fs.files")
            .findOne({"_id": new ObjectID(fileID), "metadata.link": tempToken}) as FileInterface;

        return file;
    }

    makeOneTimePublic = async(fileID: string, userID: string, token: string) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": new ObjectID(fileID), 
            "metadata.owner": userID}, 
            {"$set": {"metadata.linkType": "one", "metadata.link": token}}) as FileInterface;

        return file;
    }

    getFileInfo = async(fileID: string, userID: string) => {

        const file = await conn.db.collection("fs.files")
            .findOne({"metadata.owner": userID, "_id": new ObjectID(fileID)}) as FileInterface;

        return file;
    }

    getQuickList = async(userID: string) => {

        const fileList = await conn.db.collection("fs.files")
            .find({"metadata.owner": userID})
            .sort({uploadDate: -1})
            .limit(10)
            .toArray() as FileInterface[];

        return fileList;
    }

    getList = async(queryObj: QueryInterface, sortBy: string, limit: number) => {

        const fileList = await conn.db.collection("fs.files")
            .find(queryObj)
            .sort(sortBy)
            .limit(limit)
            .toArray() as FileInterface[];


        return fileList;
    }

    removeTempToken = async(user: UserInterface, tempToken: string) => {

        user.tempTokens = user.tempTokens.filter((filterToken) => {
            
            return filterToken.token !== tempToken;
        });

        return user;
    }

    getFileSearchList = async(userID: string, searchQuery: RegExp) => {

        const fileList = await conn.db.collection("fs.files")
        .find({"metadata.owner": userID, "filename": searchQuery})
        .limit(10)
        .toArray() as FileInterface[];

        return fileList;
    }

    renameFile = async(fileID: string, userID: string, title: string) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": new ObjectID(fileID), 
            "metadata.owner": userID}, {"$set": {"filename": title}}) as FileInterface;
    
        return file;
    }

    moveFile = async(fileID: string, userID: string, parent: string, parentList: string) => {

        const file = await conn.db.collection("fs.files")
            .findOneAndUpdate({"_id": new ObjectID(fileID), 
            "metadata.owner": userID}, {"$set": {"metadata.parent": parent, "metadata.parentList": parentList}})
    
        return file;
    }

    getFileListByParent = async(userID: string, parentListString: string) => {

        const fileList = await conn.db.collection("fs.files")
            .find({"metadata.owner": userID, 
            "metadata.parentList":  {$regex : `.*${parentListString}.*`}}).toArray() as FileInterface[];
        
        return fileList;
    }

    getFileListByOwner = async(userID: string) => {

        const fileList = await conn.db.collection("fs.files")
                        .find({"metadata.owner": userID}).toArray() as FileInterface[];

        return fileList;
    }

    removeChunksByID = async(fileID: string) => {

        await conn.db.collection("fs.chunks").deleteMany({files_id: fileID});
    }
}

export default DbUtil;