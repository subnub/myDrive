import { ObjectId } from "mongodb";
import { FileListQueryType } from "../types/file-types";
import { FolderListQueryType } from "../types/folder-types";

export interface FileQueryInterface {
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
  "metadata.isVideo"?: boolean | null;
  "metadata.processingFile"?: boolean | null;
}

export const createFileQuery = ({
  userID,
  search,
  parent,
  startAtDate,
  startAtName,
  trashMode,
  mediaMode,
  sortBy,
  mediaFilter,
}: FileListQueryType) => {
  const query: FileQueryInterface = { "metadata.owner": userID };

  if (search && search !== "") {
    query["filename"] = new RegExp(search, "i");
  } else if (!mediaMode) {
    query["metadata.parent"] = parent;
  }

  if (sortBy === "date_desc" && startAtDate) {
    query.uploadDate = { $lt: new Date(startAtDate) };
  } else if (sortBy === "date_asc" && startAtDate) {
    query.uploadDate = { $gt: new Date(startAtDate) };
  } else if (sortBy === "alp_desc" && startAtName) {
    query.filename = { $lt: startAtName };
  } else if (sortBy === "alp_asc" && startAtName) {
    query.filename = { $gt: startAtName };
  }

  if (trashMode) {
    query["metadata.trashed"] = true;
  } else {
    query["metadata.trashed"] = null;
  }

  if (mediaMode) {
    query["metadata.hasThumbnail"] = true;

    if (mediaFilter === "photos") {
      query["metadata.isVideo"] = false;
    } else if (mediaFilter === "videos") {
      query["metadata.isVideo"] = true;
    }
  }

  query["metadata.processingFile"] = null;

  return query;
};

export interface FolderQueryInterface {
  owner: ObjectId | string;
  parent?: string;
  name?: string | RegExp;
  trashed?: boolean | null;
}

export const createFolderQuery = ({
  userID,
  search,
  parent,
  trashMode,
}: FolderListQueryType) => {
  const query: FolderQueryInterface = { owner: userID };

  if (search && search !== "") {
    query["name"] = new RegExp(search, "i");
  } else {
    query["parent"] = parent;
  }

  if (trashMode) {
    query["trashed"] = true;
  } else {
    query["trashed"] = null;
  }

  return query;
};
