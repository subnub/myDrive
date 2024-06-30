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
  const { isTrash } = useUtils();
  const filesReactQuery = useInfiniteQuery(
    [
      "files",
      {
        parent: params.id || "/",
        search: params.query || "",
        sortBy,
        limit: undefined,
        trashMode: isTrash,
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
  const { isTrash } = useUtils();

  const invalidateFilesCache = () => {
    filesReactClientQuery.invalidateQueries({
      queryKey: [
        "files",
        {
          parent: params.id || "/",
          search: params.query || "",
          sortBy,
          limit: undefined,
          trashMode: isTrash,
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
  const { isHome } = useUtils();
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
      if (!isQuickFile && listView) return;
      console.log("getting thumbnail", thumbnailID);
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
    requestedThumbnail.current,
  ]);

  useEffect(() => {
    if (!hasThumbnail || !thumbnailID) return;

    getThumbnail();
  }, [hasThumbnail, getThumbnail]);

  return { ...state, imageOnError };
};

export const useSearchSuggestions = (searchText: string) => {
  const { isTrash } = useUtils();
  const searchQuery = useQuery(
    [
      "search",
      {
        searchText,
        trashMode: isTrash,
      },
    ],
    getSuggestedListAPI,
    { enabled: searchText.length !== 0 }
  );

  return { ...searchQuery };
};
