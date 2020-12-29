import NotAuthorizedError from "../../utils/NotAuthorizedError";
import NotFoundError from "../../utils/NotFoundError";
import env from "../../enviroment/env";
import jwt from "jsonwebtoken";
import Folder from "../../models/folder";
import sortBySwitch from "../../utils/sortBySwitch";
import createQuery from "../../utils/createQuery";
import DbUtilFile from "../../db/utils/fileUtils/index";
import DbUtilFolder from "../../db/utils/folderUtils";
import { UserInterface } from "../../models/user";
import { FileInterface } from "../../models/file";
import tempStorage from "../../tempStorage/tempStorage";

const dbUtilsFile = new DbUtilFile();
const dbUtilsFolder = new DbUtilFolder();

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

 
class MongoFileService {

    constructor() {

    }

    removePublicOneTimeLink = async(currentFile: FileInterface) => {

        const fileID = currentFile._id;

        if (currentFile.metadata.linkType === "one") {

            await dbUtilsFile.removeOneTimePublicLink(fileID);
        }
    }

    removeLink = async(userID: string, fileID: string) => {

        const file = await dbUtilsFile.removeLink(fileID, userID);
        
        if (!file.lastErrorObject.updatedExisting) throw new NotFoundError("Remove Link File Not Found Error")
    }

    makePublic = async(userID: string, fileID: string) => {

        const token = jwt.sign({_id: userID.toString()}, env.passwordAccess!);

        const file = await dbUtilsFile.makePublic(fileID, userID, token);

        if (!file.lastErrorObject.updatedExisting) throw new NotFoundError("Make Public File Not Found Error");
            
        return token;
    }

    getPublicInfo = async(fileID: string, tempToken: string) => {

        const file: FileInterface = await dbUtilsFile.getPublicInfo(fileID, tempToken);
    
        if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
    
            throw new NotFoundError("Public Info Not Found");
    
        } else {
    
            return file;
        } 
    }

    makeOneTimePublic = async(userID: string, fileID: string) => {

        const token = jwt.sign({_id: userID.toString()}, env.passwordAccess!);

        const file = await dbUtilsFile.makeOneTimePublic(fileID, userID, token);

        if (!file.lastErrorObject.updatedExisting) throw new NotFoundError("Make One Time Public Not Found Error");

        return token;
    }

    getFileInfo = async(userID: string, fileID: string) => {

        let currentFile = await dbUtilsFile.getFileInfo(fileID, userID)
    
        if (!currentFile) throw new NotFoundError("Get File Info Not Found Error");
    
        const parentID = currentFile.metadata.parent
    
        let parentName = ""; 
    
        if (parentID === "/") {
    
            parentName = "Home"
    
        } else {
    
            const parentFolder = await Folder.findOne({"owner": userID, "_id": parentID});
                
            if (parentFolder) {
    
                parentName = parentFolder.name;
    
            } else {
    
                parentName = "Unknown"
            }
    
        }
    
        return {...currentFile, parentName}
    }

    getQuickList = async(user: userAccessType | UserInterface) => {

        const userID = user._id;
        const s3Enabled = user.s3Enabled ? true : false;

        const quickList = await dbUtilsFile.getQuickList(userID, s3Enabled);

        if (!quickList) throw new NotFoundError("Quick List Not Found Error");
            
        return quickList;
    }

    getList = async(user: userAccessType | UserInterface, query: any) => {

        const userID = user._id;

        let searchQuery = query.search || "";
        const parent = query.parent || "/";
        let limit = query.limit || 50;
        let sortBy = query.sortby || "DEFAULT"
        const startAt = query.startAt || undefined
        const startAtDate = query.startAtDate || "0"
        const startAtName = query.startAtName || ""
        const storageType = query.storageType || undefined;
        const folderSearch = query.folder_search || undefined;
        sortBy = sortBySwitch(sortBy)
        limit = parseInt(limit)

        const s3Enabled = user.s3Enabled ? true : false;
    
        const queryObj = createQuery(userID, parent, query.sortby,startAt, startAtDate, searchQuery, s3Enabled ,startAtName, storageType, folderSearch);

        const fileList = await dbUtilsFile.getList(queryObj, sortBy, limit);

        if (!fileList) throw new NotFoundError("File List Not Found");

        return fileList;
    }

    getDownloadToken = async(user: UserInterface) => {

        const tempToken = await user.generateTempAuthToken();

        if (!tempToken) throw new NotAuthorizedError("Get Download Token Not Authorized Error");

        return tempToken;
    }

    // No longer needed left for reference

    // getDownloadTokenVideo = async(user: UserInterface, cookie: string) => {

    //     if (!cookie) throw new NotAuthorizedError("Get Download Token Video Cookie Not Authorized Error");

    //     const tempToken = await user.generateTempAuthTokenVideo(cookie);

    //     if (!tempToken) throw new NotAuthorizedError("Get Download Token Video Not Authorized Error");

    //     return tempToken;
    // }

    removeTempToken = async(user: UserInterface, tempToken: any, currentUUID: string) => {

        const key = user.getEncryptionKey();

        const decoded = await jwt.verify(tempToken, env.passwordAccess!) as any;

        const publicKey = decoded.iv;

        const encryptedToken = user.encryptToken(tempToken, key, publicKey);

        const removedTokenUser = await dbUtilsFile.removeTempToken(user, encryptedToken);

        if (!removedTokenUser) throw new NotFoundError("Remove Temp Token User Not Found Errors");

        delete tempStorage[currentUUID];

        await removedTokenUser.save();
    }

    getSuggestedList = async(userID: string, searchQuery: any) => {

        searchQuery = new RegExp(searchQuery, 'i')
    
        const fileList = await dbUtilsFile.getFileSearchList(userID, searchQuery);
        const folderList = await dbUtilsFolder.getFolderSearchList(userID, searchQuery);

        if (!fileList || !folderList) throw new NotFoundError("Suggested List Not Found Error");

        return {
            fileList,
            folderList
        }
    }

    renameFile = async(userID: string, fileID: string, title: string) => {

        const file = await dbUtilsFile.renameFile(fileID, userID, title);

        if (!file.lastErrorObject.updatedExisting) throw new NotFoundError("Rename File Not Found Error");

        return file;
    }

    moveFile = async(userID: string, fileID: string, parentID: string) => {

        let parentList = ["/"];

        if (parentID.length !== 1) {

            const parentFile = await dbUtilsFolder.getFolderInfo(parentID, userID);
            if (!parentFile) throw new NotFoundError("Rename Parent File Not Found Error")
            const parentList = parentFile.parentList;
            parentList.push(parentID);
        }

        const file = await dbUtilsFile.moveFile(fileID, userID, parentID, parentList.toString());

        if (!file.lastErrorObject.updatedExisting) throw new NotFoundError("Rename File Not Found Error");

        return file;
    }
}

export default MongoFileService;