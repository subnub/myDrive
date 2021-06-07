import { FileInterface } from '../../../models/file';
import { UserInterface } from '../../../models/user';
import createThumbnailS3 from './createThumbnailS3';
import createThumbnailMongo from './createThumbnail';
import createThumbnailFilesystem from './createThumbnailFS';
import env from '../../../enviroment/env';
import { fileTypes } from '../../../types/fileTypes';
import FileUtils from '../../../db/utils/fileUtils';

const fileUtils = new FileUtils();

const addThumbnailAndPreviewID = async (
  file: FileInterface,
  thumbnailID: string,
  previewID: string,
) => {
  const fileID = file._id;
  // const getUpdatedFile = await conn.db
  //   .collection('fs.files')
  //   .findOneAndUpdate(
  //     { _id: file._id },
  //     {
  //       $set: updateData,
  //     },
  //   );
  const data = {
    'metadata.thumbnailID': thumbnailID,
    'metadata.previewID': previewID,
  };
  const updateQuery = await fileUtils.updateFileData(fileID, data);
  const updatedFile = updateQuery.value;

  return {
    ...updatedFile,
    metadata: {
      ...updatedFile.metadata,
      thumbnailID,
      previewID,
    },
  };
};

const createThumnailAny = async (
  currentFile: FileInterface,
  filename: string,
  user: UserInterface,
) => {
  if (
    currentFile.metadata.fileType === fileTypes.personalDrive ||
    env.dbType === 's3'
  ) {
    const thumbnailID = await createThumbnailS3(currentFile, filename, user);
    const previewID = await createThumbnailS3(
      currentFile,
      filename,
      user,
      1080,
    );
    const updatedFile = await addThumbnailAndPreviewID(
      currentFile,
      thumbnailID,
      previewID,
    );

    return updatedFile;
  } else if (env.dbType === 'mongo') {
    const thumbnailID = await createThumbnailMongo(currentFile, filename, user);
    const previewID = await createThumbnailMongo(
      currentFile,
      filename,
      user,
      1080,
    );
    const updatedFile = await addThumbnailAndPreviewID(
      currentFile,
      thumbnailID,
      previewID,
    );

    return updatedFile;
  } else {
    const thumbnailID = await createThumbnailFilesystem(
      currentFile,
      filename,
      user,
    );
    const previewID = await createThumbnailFilesystem(
      currentFile,
      filename,
      user,
      1080,
    );
    const updatedFile = await addThumbnailAndPreviewID(
      currentFile,
      thumbnailID,
      previewID,
    );
    return updatedFile;
  }
};

export default createThumnailAny;
