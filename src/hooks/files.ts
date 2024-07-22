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
import { addFileUploadCancelToken } from "../utils/cancelTokenManager";
import { debounce } from "lodash";
import { addUpload, editUpload } from "../reducers/uploader";

export const useFiles = (enabled = true) => {
  const params = useParams();
  // TODO: Remove any
  const sortBy = useAppSelector((state) => state.filter.sortBy);
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

interface thumbnailState {
  hasThumbnail: boolean;
  image: undefined | string;
}

export const useThumbnail = (
  hasThumbnail: boolean,
  thumbnailID?: string,
  isQuickFile?: boolean
) => {
  const requestedThumbnail = useRef(false);
  const [state, setState] = useState<thumbnailState>({
    hasThumbnail: false,
    image: undefined,
  });
  const { isHome, isMedia } = useUtils();
  const listView = useAppSelector((state) => state.filter.listView);

  const imageOnError = useCallback(() => {
    setState({
      hasThumbnail: false,
      image: undefined,
    });
  }, []);
  const getThumbnail = useCallback(async () => {
    try {
      if (!thumbnailID || requestedThumbnail.current) return;
      if (isQuickFile && !isHome) return;
      if (!isQuickFile && listView && !isMedia) return;
      requestedThumbnail.current = true;
      const thumbnailData = await getFileThumbnailAPI(thumbnailID);
      setState({
        hasThumbnail: true,
        image: thumbnailData,
      });
    } catch (e) {
      console.log("error getting thumbnail data", e);
      imageOnError();
    }
  }, [
    thumbnailID,
    getFileThumbnailAPI,
    imageOnError,
    listView,
    isHome,
    isQuickFile,
  ]);

  useEffect(() => {
    if (!hasThumbnail || !thumbnailID) return;

    getThumbnail();

    return () => {
      requestedThumbnail.current = false;
    };
  }, [hasThumbnail, getThumbnail, thumbnailID]);

  return { ...state, imageOnError };
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

  const uploadFiles = async (files: FileList) => {
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

      try {
        await uploadFileAPI(data, config);
        dispatch(
          editUpload({
            id: currentID,
            updateData: { completed: true, progress: 100 },
          })
        );
      } catch (e) {
        console.log("Error uploading file", e);
        dispatch(
          editUpload({
            id: currentID,
            updateData: { canceled: true },
          })
        );
      }
    }
  };

  return { uploadFiles };
};
