import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";
import { getUserToken } from "./user";

interface QueryKeyParams {
  parent: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  startAtDate?: string;
  startAtName?: string;
  startAt?: boolean;
  trashMode?: boolean;
}

// GET

export const getFilesListAPI = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<[string, QueryKeyParams]>) => {
  const [
    _key,
    { parent = "/", search = "", sortBy = "date_desc", limit = 50, trashMode },
  ] = queryKey;

  const queryParams: QueryKeyParams = {
    parent,
    search,
    sortBy,
    limit,
    trashMode,
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

export const getQuickFilesListAPI = async () => {
  const response = await axios.get(`/file-service/quick-list`, {
    params: {
      limit: 20,
    },
  });
  return response.data;
};

export const downloadFileAPI = async (fileID: string) => {
  await getUserToken();

  // TODO: Change this
  const url = `http://localhost:5173/api/file-service/download/${fileID}`;

  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = url;
  link.setAttribute("type", "hidden");
  link.setAttribute("download", "true");
  link.click();
};

export const getFileThumbnailAPI = async (thumbnailID: string) => {
  // TODO: Change this
  const url = `http://localhost:5173/api/file-service/thumbnail/${thumbnailID}`;
  const config = {
    responseType: "arraybuffer",
  };

  const response = await axios.get(url, config);

  const imgFile = new Blob([response.data]);
  const imgUrl = URL.createObjectURL(imgFile);

  return imgUrl;
};

export const getSuggestedListAPI = async ({
  queryKey,
}: QueryFunctionContext<
  [string, { searchText: string; trashMode: boolean }]
>) => {
  const [_key, { searchText, trashMode }] = queryKey;
  const response = await axios.get(`/file-service/suggested-list`, {
    params: {
      search: searchText,
      trashMode,
    },
  });
  return response.data;
};

// PATCH

export const trashFileAPI = async (fileID: string) => {
  const response = await axios.patch(`/file-service/trash`, {
    id: fileID,
  });
  return response.data;
};

export const trashMultiAPI = async (items: any) => {
  const response = await axios.patch(`/file-service/trash-multi`, {
    items,
  });
  return response.data;
};

export const restoreFileAPI = async (fileID: string) => {
  const response = await axios.patch(`/file-service/restore`, {
    id: fileID,
  });
  return response.data;
};

export const restoreMultiAPI = async (items: any) => {
  const response = await axios.patch(`/file-service/restore-multi`, {
    items,
  });
  return response.data;
};

export const renameFileAPI = async (fileID: string, name: string) => {
  const response = await axios.patch(`/file-service/rename`, {
    id: fileID,
    title: name,
  });
  return response.data;
};

// DELETE
export const deleteFileAPI = async (fileID: string) => {
  const response = await axios.delete(`/file-service/remove`, {
    data: {
      id: fileID,
    },
  });
  return response.data;
};

export const deleteMultiAPI = async (items: any) => {
  const response = await axios.delete(`/file-service/remove-multi`, {
    data: {
      items,
    },
  });
  return response.data;
};
