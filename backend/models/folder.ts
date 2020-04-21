import mongoose, {Document} from "mongoose";

const folderSchema = new mongoose.Schema({
    
    name: {
        type: String, 
        required: true,
    },
    
    parent: {
        type: String, 
        required: true,
    },
    
    owner: {
        type: String, 
        required: true
    },

    parentList: {
        type: Array,
        required:true
    }

    
}, {
    timestamps: true
})

export interface FolderInterface extends Document {
    name: string,
    parent: string,
    owner: string,
    parentList: string[],
    _doc?: any
}

const Folder = mongoose.model<FolderInterface>("Folder", folderSchema);

export default Folder;