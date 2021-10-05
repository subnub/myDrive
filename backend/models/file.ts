import mongoose, { Document } from 'mongoose';
import { Binary, ObjectID } from 'mongodb';
import { fileTypes } from '../types/fileTypes';

const fileSchema = new mongoose.Schema({
  length: {
    type: Number,
    required: true,
  },
  chunkSize: {
    type: Number,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  itemType: String,
  metadata: {
    type: {
      uniqueFileName: {
        type: String,
        required: true,
      },
      owner: {
        type: String,
        required: true,
      },
      trash: {
        type: Boolean,
        required: true,
      },
      trashedTime: {
        type: Number,
        required: true,
      },
      parent: {
        type: String,
        required: true,
      },
      parentList: {
        type: String,
        required: true,
      },
      hasThumbnail: {
        type: Boolean,
        required: true,
      },
      isVideo: {
        type: Boolean,
        required: true,
      },
      isAudio: {
        type: Boolean,
        required: true,
      },
      thumbnailID: String,
      previewID: String,
      size: {
        type: Number,
        required: true,
      },
      IV: {
        type: Binary,
        required: true,
      },
      linkType: String,
      link: String,
      filePath: String,
      s3ID: String,
      personalFile: Boolean,
      fileType: String,
    },
    required: true,
  },
});

export interface FileInterface extends Document {
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
  lastErrorObject: { updatedExisting: any };
  metadata: {
    uniqueFileName: string;
    owner: string | ObjectID;
    parent: string;
    parentList: string;
    hasThumbnail: boolean;
    isVideo: boolean;
    isAudio: boolean;
    trash: boolean;
    trashedTime: Number;
    thumbnailID?: string;
    previewID?: string;
    size: number;
    IV: Buffer;
    linkType?: 'one' | 'public';
    link?: string;
    filePath?: string;
    s3ID?: string;
    personalFile?: boolean;
    fileType?: keyof typeof fileTypes;
  };
}

const File = mongoose.model<FileInterface>('fs.files', fileSchema);

export default File;
module.exports = File;
