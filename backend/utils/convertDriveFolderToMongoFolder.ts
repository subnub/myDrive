const convertDriveFolderToMongoFolder = (driveObj: any, ownerID: string) => {

    let convertedObj:any = {};
    convertedObj._id = driveObj.id;
    convertedObj.name = driveObj.name;
    convertedObj.createdAt = driveObj.createdTime;
    convertedObj.owner = ownerID;
    convertedObj.parent = driveObj.parents[driveObj.parents.length - 1];
    convertedObj.parentList = driveObj.parents;
    convertedObj.updatedAt = driveObj.createdTime;
    convertedObj.drive = true;
    convertedObj.googleDoc = driveObj.mimeType === "application/vnd.google-apps.document";

    return convertedObj;
}

export default convertDriveFolderToMongoFolder;