import { S3Actions } from "../actions/S3-actions";
import { FilesystemActions } from "../actions/file-system-actions";
import env from "../../../enviroment/env";

export const getStorageActions = () => {
  if (env.dbType === "s3") {
    return new S3Actions();
  } else {
    return new FilesystemActions();
  }
};
