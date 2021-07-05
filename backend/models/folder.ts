import mongoose, { Document } from 'mongoose';
import { fileTypes } from '../types/fileTypes';

const folderSchema = new mongoose.Schema(
  {
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
      required: true,
    },

    parentList: {
      type: Array,
      required: true,
    },
    personalFolder: Boolean,
    fileType: String,
    trash: Boolean,
  },
  {
    timestamps: true,
  },
);

export interface FolderInterface extends Document {
  name: string;
  parent: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  parentList: string[];
  _doc?: any;
  personalFolder?: boolean;
  fileType?: keyof typeof fileTypes;
  trash?: Boolean;
}

const Folder = mongoose.model<FolderInterface>('Folder', folderSchema);

export default Folder;
