"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const fileSchema = new mongoose_1.default.Schema({
    length: {
        type: Number,
        required: true,
    },
    chunkSize: {
        type: Number,
    },
    uploadDate: {
        type: Date,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    metadata: {
        type: {
            owner: {
                type: String,
                required: true
            },
            parent: {
                type: String,
                required: true
            },
            parentList: {
                type: String,
                required: true
            },
            hasThumbnail: {
                type: Boolean,
                required: true
            },
            isVideo: {
                type: Boolean,
                required: true
            },
            thumbnailID: String,
            size: {
                type: Number,
                required: true,
            },
            IV: {
                type: mongodb_1.Binary,
                required: true
            },
            linkType: String,
            link: String,
            filePath: String
        },
        required: true
    }
});
const File = mongoose_1.default.model("fs.files", fileSchema);
exports.default = File;
