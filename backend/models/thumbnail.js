const mongoose = require("mongoose");

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

const Thumbnail = mongoose.model("Thumbnail", thumbnailSchema);

module.exports = Thumbnail;