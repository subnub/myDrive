import s3 from '../db/s3';
import { ObjectID } from 'mongodb';
import { fileListQueryType, fileTypes } from '../types/fileTypes';

export interface QueryInterface {
  '_id'?: {
    $lt?: ObjectID;
    $gt?: ObjectID;
    $ne?: ObjectID;
  };
  'metadata.owner': ObjectID;
  'metadata.parent'?: string;
  'metadata.uniqueFileName'?:
    | string
    | RegExp
    | {
        $lt?: string;
        $gt?: string;
        $gte?: string;
        $lte?: string;
        $ne?: ObjectID;
      };
  'filename'?:
    | string
    | RegExp
    | {
        $lt?: string;
        $gt?: string;
        $gte?: string;
        $lte?: string;
        $ne?: ObjectID;
      };
  'uploadDate'?: {
    $lt?: Date;
    $gt?: Date;
    $gte?: Date;
    $lte?: Date;
    $ne?: ObjectID;
  };
  'metadata.personalFile'?: boolean | null;
  'metadata.fileType'?: keyof typeof fileTypes;
  'metadata.previewID'?: any;
  'metadata.trash'?: boolean;
}

const createQuery = (fileListQuery: fileListQueryType) => {
  const {
    userID,
    parent,
    sortBy,
    startAt,
    startAtDate,
    searchQuery,
    startAtName,
    folderSearch,
    fileType,
    filterByItemType,
    trash,
    pageToken,
    pageTokenDocument,
  } = fileListQuery;
  let query: QueryInterface = { 'metadata.owner': new ObjectID(userID) };

  //console.log('start');

  if (searchQuery && searchQuery !== '') {
    const regExpSearchQuery = new RegExp(searchQuery, 'i');

    query = { ...query, filename: regExpSearchQuery };

    if (parent !== '/' || folderSearch)
      query = { ...query, 'metadata.parent': parent };
    //if (parent === "home") query = {...query, "metadata.parent": "/"};
  } else {
    query = { ...query, 'metadata.parent': parent };
  }

  console.log('sort-By', sortBy);

  //console.log('fnisihed search');

  // const startAtDateOrName = startAtDate || startAtName
  // if (startAt && startAtDateOrName) {

  // }

  const startAtAndSortByCheck = !!(startAt && sortBy);
  console.log(
    'start at and sort by check',
    startAtAndSortByCheck,
    sortBy,
    startAt,
    startAtName,
    startAtDate,
  );
  // if (startAtDate && startAtAndSortByCheck) {
  //   if (sortBy === 'date_desc' || sortBy === 'default') {
  //     query = { ...query, uploadDate: { $lt: new Date(startAtDate) } };
  //   } else if (sortBy === 'date_asc') {
  //     query = { ...query, uploadDate: { $gt: new Date(startAtDate) } };
  //   } else if (sortBy === 'date_desc' || sortBy === 'default') {
  //     query = { ...query, uploadDate: { $lt: new Date(startAtDate) } };
  //   } else if (sortBy === 'date_asc') {
  //     query = { ...query, uploadDate: { $gt: new Date(startAtDate) } };
  //   }
  // }
  console.log('page token', pageToken);

  if (pageTokenDocument) {
    const filename = pageTokenDocument.metadata.uniqueFileName;
    const uploadDate = pageTokenDocument.uploadDate;
    const _id = pageTokenDocument._id;
    if (sortBy === 'alp_asc') {
      query = {
        ...query,
        'metadata.uniqueFileName': { $gte: filename },
        '_id': { $ne: new ObjectID(_id) },
      };
    } else if (sortBy === 'alp_desc') {
      query = {
        ...query,
        'metadata.uniqueFileName': { $lte: filename },
        '_id': { $ne: new ObjectID(_id) },
      };
    } else if (sortBy === 'date_asc') {
      query = {
        ...query,
        uploadDate: { $gte: new Date(uploadDate) },
        _id: { $ne: new ObjectID(_id) },
      };
    } else if (sortBy === 'date_desc' || sortBy === 'default') {
      query = {
        ...query,
        uploadDate: { $lte: new Date(uploadDate) },
        _id: { $ne: new ObjectID(_id) },
      };
    }
  }

  // if (pageTokenDocument) {
  //   if (sortBy === 'alp_asc') {
  //     query = { ...query, _id: { $lt: new ObjectID(pageToken) } };
  //   } else if (sortBy === 'date_desc' || sortBy === 'alp_desc') {
  //     query = { ...query, _id: { $lt: new ObjectID(pageToken) } };
  //   } else {
  //     query = { ...query, _id: { $gt: new ObjectID(pageToken) } };
  //   }
  // }

  // if (startAtAndSortByCheck) {
  //   if (startAtDate) {
  //     if (sortBy === 'date_desc' || sortBy === 'default') {
  //       query = { ...query, uploadDate: { $lt: new Date(startAtDate) } };
  //     } else if (sortBy === 'date_asc') {
  //       query = { ...query, uploadDate: { $gt: new Date(startAtDate) } };
  //     }
  //   }
  // } else if (startAtName && startAtAndSortByCheck) {
  //   if (sortBy === 'alp_desc') {
  //     console.log('sortby alp desc');
  //     query = { ...query, filename: { $lt: startAtName } };
  //   } else {
  //     query = { ...query, filename: { $gt: startAtName } };
  //   }
  // }

  // console.log('query-obj', query);
  // if (startAt) {
  //   console.log('start at setting query', sortBy);
  //   if ((startAtDate && sortBy === 'date_desc') || sortBy === 'DEFAULT') {
  //     query = { ...query, uploadDate: { $lt: new Date(startAtDate) } };
  //   } else if (sortBy === 'date_asc') {
  //     query = { ...query, uploadDate: { $gt: new Date(startAtDate) } };
  // } else if (sortBy === 'alp_desc') {
  //   console.log('sortby alp desc');
  //   query = { ...query, filename: { $lt: startAtName } };
  // } else {
  //   query = { ...query, filename: { $gt: startAtName } };
  //   }
  // }

  //console.log('fnished data');
  // if (s3Enabled) {
  //     query = {...query, "metadata.personalFile": true}
  // } else
  if (fileType) {
    if (fileType === fileTypes.personalDrive) {
      query = { ...query, 'metadata.fileType': fileTypes.personalDrive };
    } else {
      query = { ...query, 'metadata.fileType': null } as any;
    }
  }

  if (filterByItemType === 'photos') {
    const photoQuery = { ...query, 'metadata.previewID': { $ne: null } };
    delete photoQuery['metadata.parent'];
    query = photoQuery;
    console.log('image list query', query);
  }

  if (trash) {
    query = {
      ...query,
      'metadata.trash': true,
    };
  } else {
    query = { ...query, 'metadata.trash': false } as any;
  }

  //console.log('finished types');
  // if (storageType === "s3") {
  //     query = {...query, "metadata.personalFile": true}
  // }

  //console.log('finished quqery');

  return query;
};

export default createQuery;
