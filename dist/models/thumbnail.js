"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const thumbnailSchema = new mongoose_1.default.Schema({
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
});
const Thumbnail = mongoose_1.default.model("Thumbnail", thumbnailSchema);
exports.default = Thumbnail;
