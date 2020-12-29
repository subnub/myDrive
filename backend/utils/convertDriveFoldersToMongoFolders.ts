import convertDriveFolderToMongoFolder from "./convertDriveFolderToMongoFolder";

const convertDriveFoldersToMongoFolders = (driveObjs: any, ownerID: string) => {

    let convertedFolders = [];

    for (let currentFolder of driveObjs) {
        convertedFolders.push(convertDriveFolderToMongoFolder(currentFolder, ownerID))
    }

    return convertedFolders;
}

export default convertDriveFoldersToMongoFolders;