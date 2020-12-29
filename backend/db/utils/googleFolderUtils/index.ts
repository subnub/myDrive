import {UserInterface} from "../../../models/user";
import { google } from "googleapis";
import getGoogleAuth from "../../../db/googleAuth";
import {googleQueryType} from "../../../utils/createQueryGoogle";
import createQueryGoogleFolder from "../../../utils/createQueryGoogleFolder";

const fields = 'id, name, createdTime, parents, mimeType'

class GoogleFolderUtils {

    constructor() {

    }

    getList = async(query: googleQueryType, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const limit = query.limit;

        let parent = query.parent === "/" ? "root" : query.parent;

        const {orderBy, queryBuilder} = createQueryGoogleFolder(query, parent);

        const folders = await drive.files.list({pageSize: limit, fields: `files(${fields})`, q: queryBuilder, orderBy});

        return folders;
    }

    getInfo = async(id: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});
        const folder = await drive.files.get({fileId: id, fields: fields});

        return folder;
    }

    renameFolder = async(folderID: string, title: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.update({fileId: folderID, requestBody: {name:title}});
    }

    removeFolder = async(folderID: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        await drive.files.delete({fileId:folderID});
    }

    uploadFolder = async(name: string, parent: string, user: UserInterface) => {

        parent = parent === "/" ? "root" : parent;
    
        const oauth2Client = await getGoogleAuth(user);
        const drive = google.drive({version:"v3", auth: oauth2Client});

        const folderMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parent]
        }

        const createdFolder = await drive.files.create({
            requestBody: folderMetadata,
            fields: fields
        })

        return createdFolder;
    }

    moveFolder = async(fileID: string, parentID: string, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        const previousFile = await drive.files.get({
            fileId: fileID,
            fields: fields
        })

        const previousParent = previousFile.data.parents![0];

        await drive.files.update({
            fileId: fileID,
            addParents: parentID,
            removeParents: previousParent,
            fields: fields
        })
    }
}

export default GoogleFolderUtils;