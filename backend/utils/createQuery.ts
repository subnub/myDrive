import s3 from "../db/connections/s3";
import { ObjectId } from "mongodb";
import { FileListQueryType } from "../types/file-types";

export interface QueryInterface {
  "metadata.owner": ObjectId | string;
  "metadata.parent"?: string;
  filename?:
    | string
    | RegExp
    | {
        $lt?: string;
        $gt?: string;
      };
  uploadDate?: {
    $lt?: Date;
    $gt?: Date;
  };
  "metadata.personalFile"?: boolean | null;
  "metadata.trashed"?: boolean | null;
  "metadata.hasThumbnail"?: boolean | null;
}

const createQuery = ({
  userID,
  search,
  parent,
  startAtDate,
  startAtName,
  trashMode,
  mediaMode,
  sortBy,
}: FileListQueryType) => {
  let query: QueryInterface = { "metadata.owner": userID };

  if (search && search !== "") {
    query = { ...query, filename: new RegExp(search, "i") };
  } else {
    query = { ...query, "metadata.parent": parent };
  }

  if (sortBy === "date_desc" && startAtDate) {
    query = { ...query, uploadDate: { $lt: new Date(startAtDate) } };
  } else if (sortBy === "date_asc" && startAtDate) {
    query = { ...query, uploadDate: { $gt: new Date(startAtDate) } };
  } else if (sortBy === "alp_desc" && startAtName) {
    query = { ...query, filename: { $lt: startAtName } };
  } else if (sortBy === "alp_asc" && startAtName) {
    query = { ...query, filename: { $gt: startAtName } };
  }

  if (trashMode) {
    query = { ...query, "metadata.trashed": true };
  } else {
    query = { ...query, "metadata.trashed": null };
  }

  if (mediaMode) {
    query = { ...query, "metadata.hasThumbnail": true };
  }
  return query;
};

export default createQuery;
