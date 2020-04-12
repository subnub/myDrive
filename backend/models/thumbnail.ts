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
        required: true
    }
    
}, {
    timestamps: true
})

export interface ThumbnailInterface extends Document {
    _id: string,
    name: string,
    owner: string,
    data: any
}

const Thumbnail = mongoose.model<ThumbnailInterface>("Thumbnail", thumbnailSchema);

export default Thumbnail;