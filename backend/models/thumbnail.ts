import mongoose, {Document} from "mongoose";

const thumbnailSchema = new mongoose.Schema({
    
    name: {
        type: String, 
        required: true,
    },
    owner: {
        type: String, 
        required: true
    },
    
    data: {
        type: Buffer,
    },
    path: {
        type: String
    },

    IV: {
        type: Buffer,
    },
    s3ID: String,
    personalFile: String,
}, {
    timestamps: true
})

export interface ThumbnailInterface extends Document {
    _id: any,
    name: string,
    owner: string,
    data?: any,
    path?: string,
    IV?: Buffer,
    s3ID? : string,
    personalFile?: boolean,
    createdAt: Date,
    updatedAt: Date
}

const Thumbnail = mongoose.model<ThumbnailInterface>("Thumbnail", thumbnailSchema);

export default Thumbnail;
module.exports = Thumbnail;