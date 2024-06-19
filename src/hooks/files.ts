import { useInfiniteQuery } from "react-query";
import { useParams } from "react-router-dom";
import { getFilesList } from "../api/filesAPI";

export const useFiles = () => {
  const params = useParams();
  const filesReactQuery = useInfiniteQuery(
    [
      "files",
      {
        parent: params.id || "/",
        search: "",
        sortBy: undefined,
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
