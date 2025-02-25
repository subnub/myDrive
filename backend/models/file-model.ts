import mongoose, { Document } from "mongoose";
import { Binary, ObjectId } from "mongodb";

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
    validate(value: any) {
      if (!value || value.length === 0 || value.length >= 256) {
        throw new Error(
          "Filename is required and length must be greater than 0 and 256 characters max"
        );
      }
    },
  },
  metadata: {
    type: {
      owner: {
        type: String,
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
      thumbnailID: String,
      size: {
        type: Number,
        required: true,
      },
      IV: {
        type: Buffer,
        required: true,
      },
      linkType: String,
      link: String,
      filePath: String,
      s3ID: String,
      personalFile: Boolean,
      trashed: Boolean,
      processingFile: Boolean,
    },
    required: true,
  },
});

export interface FileMetadateInterface {
  owner: string;
  parent: string;
  parentList: string;
  hasThumbnail: boolean;
  isVideo: boolean;
  thumbnailID?: string;
  size: number;
  IV: Buffer;
  linkType?: "one" | "public";
  link?: string;
  filePath?: string;
  s3ID?: string;
  personalFile?: boolean;
  trashed?: boolean | null;
  processingFile?: boolean;
}

export interface FileInterface
  extends mongoose.Document<mongoose.Types.ObjectId> {
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
  lastErrorObject: { updatedExisting: any };
  metadata: FileMetadateInterface;
}

fileSchema.index(
  { "metadata.owner": 1, "metadata.parent": 1, filename: 1 },
  { collation: { locale: "en", strength: 2 }, background: true }
);
fileSchema.index(
  { "metadata.owner": 1, "metadata.parent": 1, uploadDate: 1 },
  { background: true }
);
fileSchema.index({ "metadata.trashed": 1 }, { background: true });
fileSchema.index({ "metadata.hasThumbnail": 1 }, { background: true });

const File = mongoose.model<FileInterface>("fs.files", fileSchema);

export default File;
module.exports = File;
