import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from "react-query";
import { useParams } from "react-router-dom";
import {
  getFilesListAPI,
  getQuickFilesListAPI,
  getSuggestedListAPI,
  uploadFileAPI,
} from "../api/filesAPI";
import { useAppDispatch, useAppSelector } from "./store";
import { useUtils } from "./utils";
import { FileInterface } from "../types/file";
import { v4 as uuid } from "uuid";
import axiosNonInterceptor from "axios";
import {
  addFileUploadCancelToken,
  removeFileUploadCancelToken,
} from "../utils/cancelTokenManager";
import debounce from "lodash/debounce";
import { addUpload, editUpload } from "../reducers/uploader";
import { uploadFolderAPI } from "../api/foldersAPI";
import { useFolders } from "./folders";

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
          const hasPageWithoutMaxItemLength = pages.some(
            (page) => page.length < limit
          );
          if (!lastElement || hasPageWithoutMaxItemLength) return undefined;
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
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    );

  return { ...filesReactQuery };
};

export const useQuickFiles = (enabled = true) => {
  const quickFilesQuery: UseQueryResult<FileInterface[]> = useQuery(
    "quickFiles",
    getQuickFilesListAPI,
    {
      enabled,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return { ...quickFilesQuery };
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
  const { refetch: refetchFiles } = useFiles(false);
  const { refetch: refetchQuickFiles } = useQuickFiles(false);
  const { refetch: refetchFolders } = useFolders(false);

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
          type: "file",
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
          refetchFiles();
          refetchQuickFiles();
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

  const uploadFolder = (files: FileList) => {
    const data = new FormData();

    const parent = params.id || "/";

    data.append("parent", parent);

    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      data.append(
        "file-data",
        JSON.stringify({
          name: currentFile.name,
          size: currentFile.size,
          type: currentFile.type,
          path: currentFile.webkitRelativePath,
          index: i,
        })
      );
    }

    const firstItemPath = files[0].webkitRelativePath;
    const firstItemPathSplit = firstItemPath.split("/");

    const parentName = firstItemPathSplit[0];

    data.append("total-files", files.length.toString());

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      console.log("current file", currentFile.webkitRelativePath);
      data.append("file", currentFile, i.toString());
    }

    const CancelToken = axiosNonInterceptor.CancelToken;
    const source = CancelToken.source();

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Transfere-Encoding": "chunked",
      },
      cancelToken: source.token,
    };

    const currentID = uuid();

    dispatch(
      addUpload({
        id: currentID,
        progress: 0,
        name: parentName,
        completed: false,
        canceled: false,
        size: 100,
        type: "folder",
      })
    );

    uploadFolderAPI(data, config)
      .then(() => {
        dispatch(
          editUpload({
            id: currentID,
            updateData: { completed: true, progress: 100 },
          })
        );
        removeFileUploadCancelToken(currentID);
        refetchFiles();
        refetchQuickFiles();
        refetchFolders();
      })
      .catch((e) => {
        console.log("Error uploading folder", e);
        dispatch(
          editUpload({
            id: currentID,
            updateData: { canceled: true },
          })
        );
        removeFileUploadCancelToken(currentID);
      });
  };

  return { uploadFiles, uploadFolder };
};
