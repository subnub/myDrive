import convertDriveToMongo from "./convertDriveToMongo";

const convertDriveListToMongoList = (driveObjs, ownerID) => {

    let convertedObjs = [];

    for (let currentObj of driveObjs) {
        convertedObjs.push(convertDriveToMongo(currentObj, ownerID));
    }

    return convertedObjs;
}

export default convertDriveListToMongoList;