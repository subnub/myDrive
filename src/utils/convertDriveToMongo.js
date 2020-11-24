const convertDriveToMongo = (driveObj, ownerID) => {

    let convertedObj = {};
    convertedObj._id = driveObj.id;
    convertedObj.filename = driveObj.name;
    convertedObj.length = driveObj.size;
    convertedObj.uploadDate = driveObj.modifiedTime;
    convertedObj.metadata = {
        IV: "",
        hasThumbnail: driveObj.hasThumbnail,
        isVideo: false,
        owner: ownerID,
        parent: driveObj.parents[driveObj.parents.length - 1] === "root" ? "/" : driveObj.parents[driveObj.parents.length - 1],
        parentList: driveObj.parents,
        size: driveObj.length,
        drive: true,
        thumbnailID: driveObj.thumbnailLink
    }

    return convertedObj;
}

export default convertDriveToMongo;