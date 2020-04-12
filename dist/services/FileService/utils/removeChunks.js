"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DbUtilsFile = require("../../../db/utils/fileUtils");
const dbUtilsFile = new DbUtilsFile();
const removeChunks = (bucketStream) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadID = bucketStream.id;
        if (!uploadID || uploadID.length === 0) {
            console.log("Invalid uploadID for remove chunks");
            return;
        }
        yield dbUtilsFile.removeChunksByID(uploadID);
        console.log("Upload Request Cancelled, Chunks Removed");
    }
    catch (e) {
        console.log("Could not remove chunks for canceled upload", uploadID, e);
    }
});
module.exports = removeChunks;
