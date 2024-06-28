import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { getFolderInfoAPI, getFoldersListAPI } from "../api/foldersAPI";
import { useSelector } from "react-redux";

export const useFolders = () => {
  const params = useParams();
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const trashMode = false;
  const foldersReactQuery = useQuery(
    [
      "folders",
      {
        parent: params.id || "/",
        search: params.query || "",
        sortBy,
        limit: undefined,
        trashMode,
      },
    ],
    getFoldersListAPI
  );

  return { ...foldersReactQuery };
};

export const useFoldersClient = () => {
  const params = useParams();
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const foldersReactClientQuery = useQueryClient();
  const trashMode = false;

  const invalidateFoldersCache = () => {
    foldersReactClientQuery.invalidateQueries({
      queryKey: [
        "folders",
        {
          parent: params.id || "/",
          search: "",
          sortBy,
          limit: undefined,
          trashMode,
        },
      ],
    });
  };
  return {
    ...foldersReactClientQuery,
    invalidateFoldersCache,
  };
};

export const useFolder = () => {
  const params = useParams();
  const folderQuery = useQuery(
    [
      "folder",
      {
        id: params.id,
      },
    ],
    getFolderInfoAPI
  );

  return { ...folderQuery };
};
