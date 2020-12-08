import { UserInterface } from "../../models/user";
import getGoogleAuth from "../../db/googleAuth";
import {google} from "googleapis";
import convertDriveListToMongoList from "../../utils/convertDriveListToMongoList";
import FileService from "../FileService";
import sortGoogleMongoList from "../../utils/sortGoogleMongoList";
import convertDriveToMongo from "../../utils/convertDriveToMongo";
import convertDriveFoldersToMongoFolders from "../../utils/convertDriveFoldersToMongoFolders";
import { Response, Request } from "express";
import tempStorage from "../../tempStorage/tempStorage";
import uuid from "uuid";
import getBusboyData from "../ChunkService/utils/getBusboyData";
import axios from "axios";
import awaitUploadGoogle from "../ChunkService/utils/awaitUploadGoogle";
import {googleQueryType} from "../../utils/createQueryGoogle";
import GoogleDbFileUtils from "../../db/utils/googleFileUtils";
import sortGoogleMongoQuickFiles from "../../utils/sortGoogleMongoQuickFiles";

const googleDbFileUtils = new GoogleDbFileUtils();

interface RequestType extends Request {
    user?: UserInterface,
    auth?: boolean,
    busboy: any,
}

const fileService = new FileService();
const fields = 'id, name, size, modifiedTime, hasThumbnail, parents, mimeType, thumbnailLink, webViewLink, shared';

class GoogleFileService {

    constructor() {

        
    }

    getList = async(user: UserInterface, query: googleQueryType) => {

        const files = await googleDbFileUtils.getList(query, user);

        const nextPageToken = files.data.nextPageToken;

        const userID = user._id;

        const convertedFiles = convertDriveListToMongoList(files.data.files, userID, nextPageToken);

        return convertedFiles;
    }

    getMongoGoogleList = async(user: UserInterface, query: googleQueryType) => {
        
        const files = await googleDbFileUtils.getList(query, user);

        const nextPageToken = files.data.nextPageToken;

        const userID = user._id;

        const convertedFiles = convertDriveListToMongoList(files.data.files, userID, nextPageToken);
        
        const fileList = await fileService.getList(user, query);

        const sortedList = sortGoogleMongoList([...convertedFiles, ...fileList], query)

        return sortedList;
    }

    getFileInfo = async(user: UserInterface, id: string) => {

        const file = await googleDbFileUtils.getFileInfo(id, user);

        const userID = user._id;
        const convertedFile = convertDriveToMongo(file.data, userID);

        return convertedFile;
    }

    getGoogleMongoQuickList = async(user: UserInterface) => {

        const files = await googleDbFileUtils.getQuickList(user);

        const userID = user._id
        const convertedFiles = convertDriveListToMongoList(files.data.files, userID);
        
        const quickList = await fileService.getQuickList(user);
    
        const sortedGoogleMongoQuickList = sortGoogleMongoQuickFiles(convertedFiles, quickList);

        return sortedGoogleMongoQuickList;
    }

    getGoogleMongoSuggestedList = async(user: UserInterface, searchQuery: string) => {
        
        const {files, folders} = await googleDbFileUtils.getSuggestedList(searchQuery, user);
        
        const userID = user._id;

        const convertedFiles = convertDriveListToMongoList(files.data.files, userID);
        const convertedFolders = convertDriveFoldersToMongoFolders(folders.data.files, userID);
        
        const {fileList: mongoFileList, folderList: mongoFolderList} = await fileService.getSuggestedList(user._id, searchQuery);

        return {
            folderList: [...mongoFolderList, ...convertedFolders],
            fileList: [...mongoFileList, ...convertedFiles]
        }
    }

    renameFile = async(user: UserInterface, fileID: string, title: string) => {

        await googleDbFileUtils.renameFile(fileID, title, user);
    }

    removeFile = async(user: UserInterface, fileID: string) => {

        await googleDbFileUtils.removeFile(fileID, user);
    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const {fileMetadata, drive} = await googleDbFileUtils.getDownloadFileMetadata(fileID, user);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name! + '"');
        res.set('Content-Length', fileMetadata.data.size!); 
        
        return new Promise((resolve, reject) => {

            drive.files.get(
                {fileId: fileID, alt: "media"},
                {responseType: "stream"},
                (err, resp) => {
                if (err) {
                    console.log(err);
                    return;
                }
                resp?.data
                    .on("end", () => {resolve()})
                    .on("error", (err: any) => {
                    console.log(err);
                    reject();
                    })
                    .pipe(res);
                })
        })
    }

    downloadDoc = async(user: UserInterface, fileID: string, res: Response) => {

        const {fileMetadata, drive} = await googleDbFileUtils.getDownloadFileMetadata(fileID, user);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name! + ".pdf" + '"');
        res.set('Content-Length', fileMetadata.data.size!); 

        drive.files.export({
            fileId: fileID,
            mimeType: 'application/pdf'
        }, {
            responseType: "stream"
        }, (err, resp) => {

            if (err) {
                console.log("export err", err);
                res.end();
                return;
            }

            resp?.data.pipe(res)
        })
    }

    getThumbnail = async(user: UserInterface, fileID: string, res: Response) => {

        const {fileMetadata, drive} = await googleDbFileUtils.getDownloadFileMetadata(fileID, user);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name! + '"');
        res.set('Content-Length', fileMetadata.data.size!); 
        
        return new Promise((resolve, reject) => {
            drive.files.get(
                {fileId: fileID, alt: "media"},
                {responseType: "stream"},
                (err, resp) => {
                if (err) {
                    console.log(err);
                    return;
                }
                resp?.data
                    .on("end", () => {resolve()})
                    .on("error", (err: any) => {
                    console.log(err);
                    reject();
                    })
                    .pipe(res);
                })
        })
    }

    getFullThumbnail = async(user: UserInterface, fileID: string, res: Response) => {

        const {fileMetadata, drive} = await googleDbFileUtils.getDownloadFileMetadata(fileID, user);

        res.set('Content-Type', 'binary/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name! + '"');
        res.set('Content-Length', fileMetadata.data.size!); 
        
        return new Promise((resolve, reject) => {
            drive.files.get(
                {fileId: fileID, alt: "media"},
                {responseType: "stream"},
                (err, resp) => {
                if (err) {
                    console.log(err);
                    reject()
                    return;
                }
                resp?.data
                    .on("end", () => {resolve()})
                    .on("error", (err: any) => {
                    console.log(err);
                    reject();
                    })
                    .pipe(res);
                })
        })
    }

    streamVideo = async(user: UserInterface, fileID: string, tempUUID: string, req: RequestType, res: Response) => {

        const currentUUID = uuid.v4();
        tempStorage[tempUUID] = currentUUID;

        const {fileMetadata, drive} = await googleDbFileUtils.getDownloadFileMetadata(fileID, user);

        const fileSize = +fileMetadata.data.size!
        
        const headers = req.headers;

        const range = headers.range!
        const parts = range.replace(/bytes=/, "").split("-")
        let start = parseInt(parts[0], 10)
        let end = parts[1] 
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1

        let head = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'}

        res.writeHead(206, head);

        return new Promise((resolve, reject) => {
            drive.files.get(
                {fileId: fileID, alt: "media"},
                {responseType: "stream", headers: {
                    Range: `bytes=${start}-${end}`
                }},
                (err, resp) => {
                if (err) {
                    console.log(err);
                    return;
                }
                resp?.data
                    .on("end", () => {resolve()})
                    .on("error", (err: any) => {
                    console.log(err);
                    reject();
                    })
                    .on("data", () => {
                        if (tempStorage[tempUUID] !== currentUUID) {
                            resp?.data.destroy();
                            resolve();
                        }
                    })
                    .pipe(res);
                })
        })
    }

    uploadFile = async(user: UserInterface, busboy: any, req: RequestType, res: Response) => {

        const streamsToErrorCatch = [req, busboy];
    
        const {file, filename, formData} = await getBusboyData(busboy);
    
        let parent = formData.get("parent") || "/"
        const size = formData.get("size") || ""
    
        parent = parent === "/" ? "root" : parent;
    
        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});
        
        type fileMetadataType = {
            name?: string,
            parents?: string[]
        } 
    
        let fileMetadata: fileMetadataType = {}
        fileMetadata.name = filename;
    
        if (parent !== "/") {
            fileMetadata.parents = [parent]
        }
    
        const googleIDandKey = await user.decryptDriveIDandKey();
        const clientID = googleIDandKey.clientID;
        const clientKey = googleIDandKey.clientKey;
        const googleToken = await user.decryptDriveTokenData();
        const refreshToken = googleToken.refresh_token;
    
        const data = {
            client_id: clientID,
            client_secret: clientKey,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        }
    
        const tokenResp = await axios.post("https://www.googleapis.com/oauth2/v4/token", data);
        const accessToken = tokenResp.data.access_token
      
        const config = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Length': size,
            'Content-Type': 'application/json'
        }
    
        const axiosConfigObj = {
            headers: config,
        }
    
        const axiosBody = {
            name: filename,
            parents: [parent],
            fields: "*"
        }
    
        await awaitUploadGoogle(file, size, axiosBody, axiosConfigObj, drive, req, res, streamsToErrorCatch);

    }

    moveFile = async(user: UserInterface, fileID: string, parentID: string) => {

        await googleDbFileUtils.moveFile(fileID, parentID, user);
    }

    makeFilePublic = async(user: UserInterface, fileID: string) => {

        const publicURL = await googleDbFileUtils.makeFilePublic(fileID, user);

        return publicURL;
    }

    removePublicLink = async(user: UserInterface, fileID: string) => {

        await googleDbFileUtils.removePublicLink(fileID, user);   
    }
}

export default GoogleFileService;