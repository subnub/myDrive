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

// GET

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

export const getQuickFilesList = async () => {
  const response = await axios.get(`/file-service/quick-list`, {
    params: {
      limit: 12,
    },
  });
  return response.data;
};

export const getFileThumbnail = async (thumbnailID: string) => {
  const url = `http://localhost:5173/api/file-service/thumbnail/${thumbnailID}`;
  const config = {
    responseType: "arraybuffer",
  };

  const response = await axios.get(url, config);

  const imgFile = new Blob([response.data]);
  const imgUrl = URL.createObjectURL(imgFile);

  return imgUrl;
};

// PATCH
export const renameFile = async (fileID: string, name: string) => {
  const response = await axios.patch(`/file-service/rename`, {
    id: fileID,
    title: name,
  });
  return response.data;
};

// DELETE
export const deleteFile = async (fileID: string) => {
  const response = await axios.delete(`/file-service/remove`, {
    data: {
      id: fileID,
    },
  });
  return response.data;
};
