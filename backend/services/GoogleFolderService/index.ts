import { UserInterface } from "../../models/user";
import getGoogleAuth from "../../db/googleAuth";
import {google} from "googleapis";
import convertDriveFoldersToMongoFolders from "../../utils/convertDriveFoldersToMongoFolders";
import FolderService from "../FolderService";
import sortGoogleMongoFolderList from "../../utils/sortGoogleMongoFolderList";
import convertDriveFolderToMongoFolder from "../../utils/convertDriveFolderToMongoFolder";
import {googleQueryType} from "../../utils/createQueryGoogle";
import GoogleDbFolderUtils from "../../db/utils/googleFolderUtils";

const googleDbFolderUtils = new GoogleDbFolderUtils();

const folderService = new FolderService();

const fields = 'id, name, createdTime, parents, mimeType'

class GoogleFolderService {
    
    constructor() {

    }

    getList = async(user: UserInterface, query: googleQueryType) => {

        const folders = await googleDbFolderUtils.getList(query, user);
        
        const userID = user._id;

        const convertedFolders = convertDriveFoldersToMongoFolders(folders.data.files, userID);

        return convertedFolders;
    }

    getGoogleMongoList = async(user: UserInterface, query: any) => {

        const googleFolderList = await googleDbFolderUtils.getList(query, user);
        
        const userID = user._id;

        const convertedFolders = convertDriveFoldersToMongoFolders(googleFolderList.data.files, userID);

        const folderList = await folderService.getFolderList(user, query);

        const mongoGoogleList = sortGoogleMongoFolderList([...convertedFolders, ...folderList], query);

        return mongoGoogleList;
    }
    
    getInfo = async(user: UserInterface, id: string) => {

       const folder = await googleDbFolderUtils.getInfo(id, user);

        const userID = user._id;
        
        const convertedFolder = convertDriveFolderToMongoFolder(folder.data, userID);

        return convertedFolder;
    }

    getSubFolderList = async(user: UserInterface, id: string) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        const file = await drive.files.get({fileId: id, fields: fields});

        let folderIDList = []
        let folderNameList = []

        folderIDList.push("/");
        folderNameList.push("Home")

        const rootGet = await drive.files.get({fileId: "root"});
        const rootID = rootGet.data.id!;

        let currentID = file.data.parents![0]

        while (true) {

            if (rootID === currentID) break;

            const currentFile = await drive.files.get({fileId: currentID, fields: fields});
        
            folderIDList.splice(1, 0, currentFile.data.id!)
            folderNameList.splice(1,0, currentFile.data.name!)

            currentID = currentFile.data.parents![0];
        }

        folderIDList.push(id);
        folderNameList.push(file.data.name)

        return {
            folderIDList,
            folderNameList
        }
    }

    getSubFolderFullList = async(user: UserInterface, id: string) => {

        const oauth2Client = await getGoogleAuth(user);

        const drive = google.drive({version:"v3", auth: oauth2Client});

        const file = await drive.files.get({fileId: id, fields: fields});
    
        const parent = file.data.parents![0];
        let queryBuilder = `mimeType = "application/vnd.google-apps.folder"`
        queryBuilder += ` and "${file.data.id!}" in parents`

        const subFolders = await drive.files.list({fields: `files(${fields})`, q: queryBuilder})


        const convertedFile = convertDriveFolderToMongoFolder(file.data, user._id);
        const convertedSubFolders = convertDriveFoldersToMongoFolders(subFolders.data.files, user._id)

        let folderList: any[] = [];

        const rootGet = await drive.files.get({fileId: 'root', fields: fields});
        const rootID = rootGet.data.id!;

        let currentID = file.data.parents![0]

        folderList.push({
            _id: convertedFile._id,
            parent: convertedFile._id,
            name: convertedFile.name,
            subFolders: convertedSubFolders
        })

        while (true) {

            if (rootID === currentID) break;

            const currentFile = await drive.files.get({fileId: currentID, fields: fields});
            const currentConvertedFile = convertDriveFolderToMongoFolder(currentFile.data, user._id)

            queryBuilder = `mimeType = "application/vnd.google-apps.folder"`
            queryBuilder += ` and "${currentConvertedFile._id}" in parents`

            const currentSubFolders = await drive.files.list({fields: `files(${fields})`, q: queryBuilder})
            const currentConvertedSubFolders = convertDriveFoldersToMongoFolders(currentSubFolders.data.files, user._id)

            folderList.splice(0, 0, {
                _id: currentConvertedFile._id,
                parent: currentConvertedFile._id,
                name: currentConvertedFile.name,
                subFolders: currentConvertedSubFolders
            })
            
            currentID = currentFile.data.parents![0];
        }

        return folderList;
    }

    renameFolder = async(user: UserInterface, folderID: string, title: string) => {

        await googleDbFolderUtils.renameFolder(folderID, title, user);
    }

    removeFolder = async(user: UserInterface, folderID: string) => {

        await googleDbFolderUtils.removeFolder(folderID, user);
    }

    upload = async(user: UserInterface, name: string, parent: string) => {
        
        const createdFolder = await googleDbFolderUtils.uploadFolder(name, parent, user);
        
        const userID = user._id;

        const convertedFolder = convertDriveFolderToMongoFolder(createdFolder.data, userID)

        return convertedFolder;
    }

    moveFolder = async(user: UserInterface, fileID: string, parentID: string) => {

        await googleDbFolderUtils.moveFolder(fileID, parentID, user);

    }
}

export default GoogleFolderService;