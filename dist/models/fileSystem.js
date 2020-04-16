"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileSystemSchema = new mongoose_1.default.Schema({
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
});
const FileSystem = mongoose_1.default.model("FileSystem", fileSystemSchema);
exports.default = FileSystem;
