const mongoose = require("mongoose");

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

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;