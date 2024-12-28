import mongoose, { Document } from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      validate(value: any) {
        if (!value || value.length === 0 || value.length >= 256) {
          throw new Error(
            "Name is required and length must be greater than 0 and 256 characters max"
          );
        }
      },
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
    trashed: Boolean,
  },
  {
    timestamps: true,
  }
);

export interface FolderInterface
  extends mongoose.Document<mongoose.Types.ObjectId> {
  name: string;
  parent: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  parentList: string[];
  _doc?: any;
  personalFolder?: boolean;
  trashed: boolean | null;
}

folderSchema.index({ createdAt: 1 }, { background: true });
folderSchema.index({ owner: 1 }, { background: true });
folderSchema.index({ trashed: 1 }, { background: true });
folderSchema.index({ parent: 1 }, { background: true });
folderSchema.index({ name: 1 }, { background: true });

const Folder = mongoose.model<FolderInterface>("Folder", folderSchema);

export default Folder;
