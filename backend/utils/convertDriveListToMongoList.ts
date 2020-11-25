import convertDriveToMongo from "./convertDriveToMongo";

const convertDriveListToMongoList = (driveObjs: any, ownerID:string, pageToken?: string | null | undefined) => {

    let convertedObjs = [];

    for (let currentObj of driveObjs) {
        convertedObjs.push(convertDriveToMongo(currentObj, ownerID, pageToken));
    }

    return convertedObjs;
}

export default convertDriveListToMongoList;