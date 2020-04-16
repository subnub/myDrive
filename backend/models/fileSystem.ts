import mongoose, {Document} from "mongoose";

const fileSystemSchema = new mongoose.Schema({
    
    name: {
        type: String, 
        required: true,
    },
    owner: {
        type: String, 
        required: true
    },
    path: {
        type: String,
        required: true
    },
    parent: {
        type: String,
        required: true,
    },
    parentList: {
        type: Array,
        required: true
    },
    hasThumbnail: {
        type: Boolean,
        required: true
    },
    thumbnailID: {
        type: String
    },
    originalSize: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    isVideo: {
        type: Boolean,
        required: true
    },
    IV: {
        type: Buffer,
        required: true
    }
    
}, {
    timestamps: true
})

export interface FileSystemInterface extends Document {
    name: string,
    owner: string,
    path: string,
    parent: string,
    parentList: string[],
    hasThumbnail: boolean,
    thumbnailID?: string,
    originalSize: number,
    size: number,
    isVideo: boolean,
    IV: Buffer
}

const FileSystem = mongoose.model<FileSystemInterface>("FileSystem", fileSystemSchema);

export default FileSystem;