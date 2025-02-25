import mongoose, { Document } from "mongoose";

const thumbnailSchema = new mongoose.Schema(
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
    owner: {
      type: String,
      required: true,
    },

    data: {
      type: Buffer,
    },
    path: {
      type: String,
    },

    IV: {
      type: Buffer,
    },
    s3ID: String,
    personalFile: String,
  },
  {
    timestamps: true,
  }
);

export interface ThumbnailInterface extends Document {
  _id: any;
  name: string;
  owner: string;
  data?: any;
  path?: string;
  IV: Buffer;
  s3ID?: string;
  personalFile?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

thumbnailSchema.index({ owner: 1 });

const Thumbnail = mongoose.model<ThumbnailInterface>(
  "Thumbnail",
  thumbnailSchema
);

export default Thumbnail;
module.exports = Thumbnail;
