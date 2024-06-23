import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  getFileThumbnail,
  getFilesList,
  getQuickFilesList,
} from "../api/filesAPI";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const useFiles = () => {
  const params = useParams();
  // TODO: Remove any
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const filesReactQuery = useInfiniteQuery(
    [
      "files",
      {
        parent: params.id || "/",
        search: "",
        sortBy,
        limit: undefined,
      },
    ],
    getFilesList,
    {
      getNextPageParam: (lastPage, pages) => {
        const lastElement = lastPage[lastPage.length - 1];
        if (!lastElement) return undefined;
        return {
          startAtDate: lastElement.uploadDate,
          startAtName: lastElement.filename,
        };
      },
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

  const invalidateFilesCache = () => {
    filesReactClientQuery.invalidateQueries({
      queryKey: [
        "files",
        {
          parent: params.id || "/",
          search: "",
          sortBy,
          limit: undefined,
        },
      ],
    });
  };

  return { ...filesReactClientQuery, invalidateFilesCache };
};

export const useQuickFiles = () => {
  const quickFilesQuery = useQuery("quickFiles", getQuickFilesList);

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
  image: null | string;
}

export const useThumbnail = (hasThumbnail: boolean, thumbnailID: string) => {
  const [state, setState] = useState<thumbnailState>({
    hasThumbnail: false,
    image: null,
  });

  const getThumbnail = useCallback(async () => {
    try {
      const thumbnailData = await getFileThumbnail(thumbnailID);
      setState({
        hasThumbnail: true,
        image: thumbnailData,
      });
    } catch (e) {
      console.log("error getting thumbnail data", e);
      imageOnError();
    }
  }, [thumbnailID]);

  const imageOnError = () => {
    setState({
      hasThumbnail: false,
      image: null,
    });
  };

  useEffect(() => {
    if (!hasThumbnail) return;

    getThumbnail();
  }, [hasThumbnail, getThumbnail]);

  return { ...state, imageOnError };
};
