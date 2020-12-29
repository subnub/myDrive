import {UserInterface} from "../../../models/user";
import { google } from "googleapis";
import getGoogleAuth from "../../../db/googleAuth";
import createQueryGoogle, {googleQueryType} from "../../../utils/createQueryGoogle";

const fields = 'id, name, size, modifiedTime, hasThumbnail, parents, mimeType, thumbnailLink, webViewLink, shared';

class GoogleDbUtil {

    constructor() {

    }

    getList = async(query: googleQueryType, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const limit = query.limit;

        let parent = query.parent === "/" ? "root" : query.parent;

        const {queryBuilder, orderBy} = createQueryGoogle(query, parent)

        const previosPageToken = query.pageToken;

        const drive = google.drive({version:"v3", auth: oauth2Client});
        const files = await drive.files.list({pageSize: limit, fields: `nextPageToken, files(${fields})`, q: queryBuilder, orderBy, pageToken: previosPageToken});

        return files
    }

    getFileInfo = async(id: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});
        
        const file = await drive.files.get({fileId: id, fields: fields});

        return file;
    }

    getQuickList = async(user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
   
        const drive = google.drive({version:"v3", auth: oauth2Client});
    
        let query = 'mimeType != "application/vnd.google-apps.folder" and trashed=false';
    
        const files = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: query});

        return files;
    }

    getSuggestedList = async(searchQuery: string, user: UserInterface) => {

        const driveQuery = `name contains "${searchQuery}" and  mimeType != "application/vnd.google-apps.folder" and trashed=false`
        const driveQueryFolder = `name contains "${searchQuery}" and mimeType = "application/vnd.google-apps.folder" and trashed=false`

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});
        const files = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQuery});
        const folders = await drive.files.list({pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQueryFolder});

        return {
            files,
            folders
        }
    }

    renameFile = async(fileID: string, title: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.update({fileId: fileID, requestBody: {name:title}})
    }

    removeFile = async(fileID: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
    
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.delete({fileId:fileID});
    }

    getDownloadFileMetadata = async(fileID: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const fileMetadata = await drive.files.get({fileId: fileID, fields: "*"});

        return {fileMetadata, drive};
    }

    moveFile = async(fileID: string, parentID: string, user: UserInterface) => {

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

    makeFilePublic = async(fileID: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.permissions.create({
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

    removePublicLink = async(fileID: string, user: UserInterface) => {
    
        const {fileMetadata, drive} = await this.getDownloadFileMetadata(fileID, user);
    
        await drive.permissions.get({
            fileId: fileID,
            permissionId: fileMetadata.data.permissionIds![0]
        })
    
        await drive.permissions.delete({
            fileId: fileID,
            permissionId: fileMetadata.data.permissionIds![0]
        })
    }
}

export default GoogleDbUtil;