import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { getFoldersList } from "../api/foldersAPI";

export const useFolders = () => {
  const params = useParams();
  const foldersReactQuery = useQuery(
    [
      "folders",
      {
        parent: params.id || "/",
        search: "",
        sortBy: undefined,
        limit: undefined,
      },
    ],
    getFoldersList
  );

  return foldersReactQuery;
};
