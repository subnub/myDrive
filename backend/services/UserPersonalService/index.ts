import {UserInterface} from "../../models/user";
import File, { FileInterface } from "../../models/file";
import Folder, { FolderInterface } from "../../models/folder";
import Thumbnail, { ThumbnailInterface } from "../../models/thumbnail";
import { ObjectID } from "mongodb";;
import calculateS3Size from "../ChunkService/utils/calculateS3Size";

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

class UserPeronsalService {
    
    constructor() {
        
    }
    
    addS3Storage = async(user: UserInterface, s3Data: any, uuid: string | undefined) => {

        const {id, key, bucket} = s3Data;

        user.storageDataPersonal!.storageSize = await calculateS3Size(id, key, bucket);
        user.personalStorageCanceledDate = undefined;

        await user.encryptS3Data(id, key, bucket);

        await user.save();

        return await user.generateAuthToken(uuid);
    }

    removeS3Storage = async(user: UserInterface, uuid: string | undefined) => {
        
        const date = new Date();

        user.s3Enabled = undefined;
        user.s3Data = undefined;
        user.storageDataPersonal = undefined;
        user.personalStorageCanceledDate = date.getTime();

        await user.save();

        return await user.generateAuthToken(uuid);
    }

    downloadPersonalFileList = async(user: userAccessType) => {

        const fileList = await File.find({"metadata.owner": new ObjectID(user._id), "metadata.personalFile": true});

        const folderList = await Folder.find({"owner": user._id.toString(), 'personalFolder': true});

        const thumbnailList: ThumbnailInterface[] = [];

        for (const currentFile of fileList) {

            if (currentFile.metadata.hasThumbnail) {
                
                const currentThumbnail = await Thumbnail.findById(new ObjectID(currentFile.metadata.thumbnailID)) as ThumbnailInterface;
                thumbnailList.push(currentThumbnail);
            }
        }

        const combined = {fileList, folderList, thumbnailList}

        const data = JSON.stringify(combined);

        return data;
    }

    uploadPersonalFileList = async(user: userAccessType, data: any) => {

        const personalFileList: FileInterface[] = data.fileList;
        const personalFolderList: FolderInterface[] = data.folderList;
        const personalThumbnailList: ThumbnailInterface[] = data.thumbnailList;
    
        const fixedFileList: FileInterface[] = []
    
        for (let currentObj of personalFileList) {
         
            await File.deleteMany({_id: new ObjectID(currentObj._id), 'metadata.owner': new ObjectID(user._id)});
        
            currentObj.metadata.owner = new ObjectID(user._id);
            currentObj._id = new ObjectID(currentObj._id)
            const oldIV: any = currentObj.metadata.IV;
            const IV: any = Buffer.from(oldIV, 'base64');
            currentObj.metadata.IV = IV;
            const newDate: any = new Date(currentObj.uploadDate);
            currentObj.uploadDate = newDate;
            currentObj.metadata.parent = currentObj.metadata.parent.toString();
            fixedFileList.push(currentObj);
            
        }
    
        const fixedFolderList: FolderInterface[] = []
    
        for (let currentObj of personalFolderList) {
    
            await Folder.deleteMany({_id: new ObjectID(currentObj._id), owner: user._id.toString()});
    
            currentObj._id = new ObjectID(currentObj._id)
            currentObj.owner = user._id.toString();
            currentObj.createdAt = new Date(currentObj.createdAt);
            currentObj.updatedAt = new Date(currentObj.updatedAt);
            fixedFolderList.push(currentObj);
        }
    
        const fixedThumbnailList: ThumbnailInterface[] = [];
    
        for (let currentObj of personalThumbnailList) {
    
            await Thumbnail.deleteMany({_id: new ObjectID(currentObj._id), owner: user._id.toString()});
    
            currentObj._id = new ObjectID(currentObj._id);
            currentObj.owner = user._id.toString();
            currentObj.createdAt = new Date(currentObj.createdAt);
            currentObj.updatedAt = new Date(currentObj.updatedAt);
            const oldIV: any = currentObj.IV;
            const IV: any = Buffer.from(oldIV, 'base64');
            currentObj.IV = IV;
            fixedThumbnailList.push(currentObj);
        }
    
        await File.insertMany(fixedFileList);
        await Folder.insertMany(fixedFolderList);
        await Thumbnail.insertMany(fixedThumbnailList);
    
    }

    removeS3Metadata = async(user: userAccessType) => {
        
        const fileList =  await File.find({"metadata.owner": new ObjectID(user._id),
        "metadata.personalFile": true})

        for (let currentFile of fileList) {

            await File.deleteOne({_id: new ObjectID(currentFile._id)});
            await File.deleteOne({_id: currentFile._id});

            if (currentFile.metadata.hasThumbnail) {

                await Thumbnail.deleteOne({_id: new ObjectID(currentFile.metadata.thumbnailID)})
                await Thumbnail.deleteOne({_id: currentFile.metadata.thumbnailID})
            }
        }

        await Folder.deleteMany({'owner': user._id.toString(), 'personalFolder': true});
    }
}

export default UserPeronsalService;