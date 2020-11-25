import { UserInterface } from "../../models/user";
import getGoogleAuth from "../../db/googleAuth";
import {google} from "googleapis";
import convertDriveListToMongoList from "../../utils/convertDriveListToMongoList";
import createQueryGoogle from "../../utils/createQueryGoogle";
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
import GoogleDbUtils from "../../db/utils/googleFileUtils";

const googleDbUtils = new GoogleDbUtils();

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

        const files = await googleDbUtils.getList(query, user);

        const nextPageToken = files.data.nextPageToken;

        const userID = user._id;

        const convertedFiles = convertDriveListToMongoList(files.data.files, userID, nextPageToken);

        return convertedFiles;
    }

    getMongoGoogleList = async(user: UserInterface, query: googleQueryType) => {

        const oauth2Client = await getGoogleAuth(user);

        const limit = query.limit;

        let parent = query.parent === "/" ? "root" : query.parent;

        const {queryBuilder, orderBy} = createQueryGoogle(query, parent)

        const previosPageToken = query.pageToken;

        const drive = google.drive({version:"v3", auth: oauth2Client});
        const files = await drive.files.list({pageSize: limit, fields: `nextPageToken, files(${fields})`, q: queryBuilder, orderBy, pageToken: previosPageToken});

        const nextPageToken = files.data.nextPageToken;

        const userID = user._id;

        const convertedFiles = convertDriveListToMongoList(files.data.files, userID, nextPageToken);
        
        const fileList = await fileService.getList(user, query);

        const sortedList = sortGoogleMongoList([...convertedFiles, ...fileList], query)

        return sortedList;
    }

    getFileInfo = async(user: UserInterface, id: string) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});
        
        const file = await drive.files.get({fileId: id, fields: fields});

        const userID = user._id;
        const convertedFile = convertDriveToMongo(file.data, userID);

        return convertedFile;
    }

    getGoogleMongoQuickList = async(user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
   
        const drive = google.drive({version:"v3", auth: oauth2Client});
    
        let query = 'mimeType != "application/vnd.google-apps.folder" and trashed=false';
    
        const files = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: query});
    
        const userID = user._id
        const convertedFiles = convertDriveListToMongoList(files.data.files, userID);
        
        const quickList = await fileService.getQuickList(user);
    
        let combinedData = [...convertedFiles, ...quickList]
    
        combinedData = combinedData.sort((a, b) => {
            const convertedDateA = new Date(a.uploadDate).getTime();
            const convertedDateB = new Date(b.uploadDate).getTime();
        
            return convertedDateB - convertedDateA;
        })

        if (combinedData.length >= 10) {
            combinedData = combinedData.slice(0, 10);
        }

        return combinedData;
    }

    getGoogleMongoSuggestedList = async(user: UserInterface, searchQuery: string) => {
        
        const driveQuery = `name contains "${searchQuery}" and  mimeType != "application/vnd.google-apps.folder" and trashed=false`
        const driveQueryFolder = `name contains "${searchQuery}" and mimeType = "application/vnd.google-apps.folder" and trashed=false`

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});
        const files = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQuery});
        const folders = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQueryFolder});
        
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

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.update({fileId: fileID, requestBody: {name:title}})
    }

    removeFile = async(user: UserInterface, fileID: string) => {

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.delete({fileId:fileID});
    }

    downloadFile = async(user: UserInterface, fileID: string, res: Response) => {

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"})

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

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"})

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

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"})

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

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"})

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

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"})

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

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        const previousFile = await drive.files.get({
            fileId: fileID,
            fields: "*"
        })

        const previousParent = previousFile.data.parents![0];

        await drive.files.update({
            fileId: fileID,
            addParents: parentID,
            removeParents: previousParent,
            fields: fields
        })
    }

    makeFilePublic = async(user: UserInterface, fileID: string) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        const publicFile = await drive.permissions.create({
            requestBody: {
                type: "anyone",
                role: "reader"
            },
            fileId: fileID,
            fields: "*"
        })

        const fileDetails = await drive.files.get({
            fileId: fileID, 
            fields: fields
        })

        const publicURL = fileDetails.data.webViewLink!;

        return publicURL;
    }

    removePublicLink = async(user: UserInterface, fileID: string) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});
    
        const fileMetadata = await drive.files.get({
            fileId: fileID,
            fields: "*",
        })
    
        const permissions = await drive.permissions.get({
            fileId: fileID,
            permissionId: fileMetadata.data.permissionIds![0]
        })
    
        console.log(permissions.data)
    
        await drive.permissions.delete({
            fileId: fileID,
            permissionId: fileMetadata.data.permissionIds![0]
        })    
    }
}

export default GoogleFileService;