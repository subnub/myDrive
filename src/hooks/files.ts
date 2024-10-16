import {
  QueryFunctionContext,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "react-query";
import { useParams } from "react-router-dom";
import {
  getFileFullThumbnailAPI,
  getFileThumbnailAPI,
  getFilesListAPI,
  getQuickFilesListAPI,
  getSuggestedListAPI,
  uploadFileAPI,
} from "../api/filesAPI";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "./store";
import { useUtils } from "./utils";
import { FileInterface } from "../types/file";
import { v4 as uuid } from "uuid";
import axiosNonInterceptor from "axios";
import {
  addFileUploadCancelToken,
  removeFileUploadCancelToken,
} from "../utils/cancelTokenManager";
import { debounce } from "lodash";
import { addUpload, editUpload } from "../reducers/uploader";

export const useFiles = (enabled = true) => {
  const params = useParams();
  // TODO: Remove any
  const sortBy = useAppSelector((state) => state.filter.sortBy);
  const mediaFilter = useAppSelector((state) => state.filter.mediaFilter);
  const { isTrash, isMedia } = useUtils();
  const limit = isMedia ? 100 : 50;
  const filesReactQuery: UseInfiniteQueryResult<FileInterface[]> =
    useInfiniteQuery(
      [
        "files",
        {
          parent: params.id || "/",
          search: params.query || "",
          sortBy,
          limit,
          trashMode: isTrash,
          mediaMode: isMedia,
          mediaFilter: mediaFilter,
        },
      ],
      getFilesListAPI,
      {
        getNextPageParam: (lastPage, pages) => {
          const lastElement = lastPage[lastPage.length - 1];
          if (!lastElement) return undefined;
          return {
            startAtDate: lastElement.uploadDate,
            startAtName: lastElement.filename,
          };
        },
        getPreviousPageParam: (firstPage, pages) => {
          const firstElement = firstPage[0];
          if (!firstElement) return undefined;
          return {
            startAtDate: firstElement.uploadDate,
            startAtName: firstElement.filename,
          };
        },
        enabled,
      }
    );

  const testFunction = () => {
    console.log("this is a test function");
  };

  return { ...filesReactQuery, testFunction };
};

export const useFilesClient = () => {
  const params = useParams();
  // TODO: Remove any
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const filesReactClientQuery = useQueryClient();
  const { isTrash, isMedia } = useUtils();
  const limit = isMedia ? 100 : 50;

  const invalidateFilesCache = () => {
    filesReactClientQuery.invalidateQueries({
      queryKey: [
        "files",
        {
          parent: params.id || "/",
          search: params.query || "",
          sortBy,
          limit,
          trashMode: isTrash,
          mediaMode: isMedia,
        },
      ],
    });
  };

  return { ...filesReactClientQuery, invalidateFilesCache };
};

export const useQuickFiles = (enabled = true) => {
  const quickFilesQuery: UseQueryResult<FileInterface[]> = useQuery(
    "quickFiles",
    getQuickFilesListAPI,
    {
      enabled,
    }
  );

  return { ...quickFilesQuery };
};

export const useQuickFilesClient = () => {
  const quickFilesReactClientQuery = useQueryClient();

  const invalidateQuickFilesCache = () => {
    quickFilesReactClientQuery.invalidateQueries({
      queryKey: "quickFiles",
    });
  };

  return { ...quickFilesReactClientQuery, invalidateQuickFilesCache };
};

export const useThumbnail = (
  thumbnailID: string | undefined,
  isQuickFile?: boolean
) => {
  const listView = useAppSelector((state) => state.filter.listView);
  const { isMedia } = useUtils();
  const disabled = listView && !isMedia && !isQuickFile;
  const thumbnailQuery = useQuery(
    ["thumbnail", { thumbnailID }],
    () => {
      if (thumbnailID) {
        return getFileThumbnailAPI(thumbnailID);
      } else {
        return undefined;
      }
    },
    {
      enabled: !!thumbnailID && !disabled,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    }
  );
  return thumbnailQuery;
};

export const useFullThumbnail = (fileID: string, isVideo: boolean) => {
  console.log("usefullthumbnail", fileID, isVideo);
  const thumbnailQuery = useQuery(
    ["full-thumbnail", { fileID }],
    () => {
      if (!isVideo) {
        return getFileFullThumbnailAPI(fileID);
      } else {
        return undefined;
      }
    },
    {
      enabled: !isVideo,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  return thumbnailQuery;
};

export const useSearchSuggestions = (searchText: string) => {
  const { isTrash, isMedia } = useUtils();
  const searchQuery = useQuery(
    [
      "search",
      {
        searchText,
        trashMode: isTrash,
        mediaMode: isMedia,
      },
    ],
    getSuggestedListAPI,
    { enabled: searchText.length !== 0 }
  );

  return { ...searchQuery };
};

export const useUploader = () => {
  const dispatch = useAppDispatch();
  const params = useParams();

  const debounceDispatch = debounce(dispatch, 200);

  const uploadFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const parent = params.id || "/";

      const currentFile = files[i];
      const currentID = uuid();

      const CancelToken = axiosNonInterceptor.CancelToken;
      const source = CancelToken.source();

      addFileUploadCancelToken(currentID, source);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          "Transfere-Encoding": "chunked",
        },
        onUploadProgress: (progressEvent: ProgressEvent<EventTarget>) => {
          const currentProgress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );

          if (currentProgress !== 100) {
            debounceDispatch(
              editUpload({
                id: currentID,
                updateData: { progress: currentProgress },
              })
            );
          }
        },
        cancelToken: source.token,
      };

      dispatch(
        addUpload({
          id: currentID,
          progress: 0,
          name: currentFile.name,
          completed: false,
          canceled: false,
          size: currentFile.size,
        })
      );

      const data = new FormData();

      data.append("filename", currentFile.name);
      data.append("parent", parent);
      data.append("currentID", currentID);
      data.append("size", currentFile.size.toString());
      data.append("file", currentFile);

      uploadFileAPI(data, config)
        .then(() => {
          dispatch(
            editUpload({
              id: currentID,
              updateData: { completed: true, progress: 100 },
            })
          );
          removeFileUploadCancelToken(currentID);
        })
        .catch((e) => {
          console.log("Error uploading file", e);
          dispatch(
            editUpload({
              id: currentID,
              updateData: { canceled: true },
            })
          );
          removeFileUploadCancelToken(currentID);
        });
    }
  };

  return { uploadFiles };
};
