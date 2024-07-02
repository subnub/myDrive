import {
  QueryFunctionContext,
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
} from "../api/filesAPI";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppSelector } from "./store";
import { useUtils } from "./utils";

export const useFiles = (enabled = true) => {
  const params = useParams();
  // TODO: Remove any
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const { isTrash, isMedia } = useUtils();
  const limit = isMedia ? 100 : 50;
  const filesReactQuery = useInfiniteQuery(
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
  const quickFilesQuery = useQuery("quickFiles", getQuickFilesListAPI, {
    enabled,
  });

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
