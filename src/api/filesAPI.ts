import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";

interface QueryKeyParams {
  parent: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  startAtDate?: string;
  startAtName?: string;
  startAt?: boolean;
}

export const getFilesList = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<[string, QueryKeyParams]>) => {
  const [
    _key,
    { parent = "/", search = "", sortBy = "date_desc", limit = 50 },
  ] = queryKey;

  const queryParams: QueryKeyParams = {
    parent,
    search,
    sortBy,
    limit,
  };

  if (pageParam?.startAtDate && pageParam?.startAtName) {
    queryParams.startAtDate = pageParam.startAtDate;
    queryParams.startAtName = pageParam.startAtName;
    queryParams.startAt = true;
  }

  const response = await axios.get(`/file-service/list`, {
    params: queryParams,
  });
  return response.data;
};
