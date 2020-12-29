import videoChecker from "./videoChecker";
import {FileInterface} from "../models/file";

const convertDriveToMongo = (driveObj: any, ownerID: string, pageToken?: string | undefined | null) => {

    let convertedObj: any = {};
    convertedObj._id = driveObj.id;
    convertedObj.filename = driveObj.name;
    convertedObj.length = driveObj.size;
    convertedObj.uploadDate = driveObj.modifiedTime;
    convertedObj.pageToken = pageToken
    convertedObj.metadata = {
        IV: "",
        hasThumbnail: driveObj.hasThumbnail,
        isVideo: videoChecker(driveObj.name),
        owner: ownerID,
        parent: driveObj.parents[driveObj.parents.length - 1] === "root" ? "/" : driveObj.parents[driveObj.parents.length - 1],
        parentList: driveObj.parents,
        size: driveObj.size,
        drive: true,
        googleDoc: driveObj.mimeType === "application/vnd.google-apps.document", 
        thumbnailID: driveObj.thumbnailLink,
        link: driveObj.shared ? driveObj.webViewLink : undefined,
        linkType: driveObj.shared ? "public" : undefined
    }

    return convertedObj;
}

export default convertDriveToMongo;