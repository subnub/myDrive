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
  mediaMode?: boolean;
}

// GET

export const getFilesListAPI = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<[string, QueryKeyParams]>) => {
  const [
    _key,
    {
      parent = "/",
      search = "",
      sortBy = "date_desc",
      limit = 50,
      trashMode,
      mediaMode,
    },
  ] = queryKey;

  const queryParams: QueryKeyParams = {
    parent,
    search,
    sortBy,
    limit,
    trashMode,
    mediaMode,
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

  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const imgFile = new Blob([response.data]);
  const imgUrl = URL.createObjectURL(imgFile);

  return imgUrl;
};

export const getFileFullThumbnailAPI = async (fileID: string) => {
  const url = `http://localhost:5173/api/file-service/full-thumbnail/${fileID}`;

  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const imgFile = new Blob([response.data]);
  const imgUrl = URL.createObjectURL(imgFile);

  return imgUrl;
};

export const getVideoTokenAPI = async () => {
  const response = await axios.get(
    "/file-service/download/access-token-stream-video"
  );
  return response.data;
};

export const getSuggestedListAPI = async ({
  queryKey,
}: QueryFunctionContext<
  [string, { searchText: string; trashMode: boolean; mediaMode: boolean }]
>) => {
  const [_key, { searchText, trashMode, mediaMode }] = queryKey;
  const response = await axios.get(`/file-service/suggested-list`, {
    params: {
      search: searchText,
      trashMode,
      mediaMode,
    },
  });
  return response.data;
};

export const getPublicFileInfoAPI = async (
  fileID: string,
  tempToken: string
) => {
  const response = await axios.get(
    `/file-service/public/info/${fileID}/${tempToken}`
  );
  return response.data;
};

export const downloadPublicFileAPI = async (
  fileID: string,
  tempToken: string
) => {
  await getUserToken();

  // TODO: Change this
  const url = `http://localhost:5173/api/file-service/public/download/${fileID}/${tempToken}`;

  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = url;
  link.setAttribute("type", "hidden");
  link.setAttribute("download", "true");
  link.click();
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

export const makePublicAPI = async (fileID: string) => {
  const response = await axios.patch(`/file-service/make-public/${fileID}`);
  return response.data;
};

export const makeOneTimePublicAPI = async (fileID: string) => {
  const response = await axios.patch(`/file-service/make-one/${fileID}`);
  return response.data;
};

export const removeLinkAPI = async (fileID: string) => {
  const response = await axios.patch(`/file-service/remove-link/${fileID}`);
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

export const deleteVideoTokenAPI = async () => {
  const response = await axios.delete(
    "/file-service/remove-stream-video-token"
  );
  return response.data;
};

// POST
export const uploadFileAPI = async (data: FormData, config: any) => {
  const url = "/file-service/upload";
  const response = await axios.post(url, data, config);
  return response.data;
};
