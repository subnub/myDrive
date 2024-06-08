import { FileInterface } from "../../../models/file";
import { UserInterface } from "../../../models/user";
import createThumbnailS3 from "./createThumbnailS3";
import createThumbnailFilesystem from "./createThumbnailFS";
import env from "../../../enviroment/env";

const createThumnailAny = async (
  currentFile: FileInterface,
  filename: string,
  user: UserInterface
) => {
  if (env.dbType === "s3") {
    return await createThumbnailS3(currentFile, filename, user);
  } else {
    return await createThumbnailFilesystem(currentFile, filename, user);
  }
};

export default createThumnailAny;
