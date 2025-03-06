import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";
import { getUserToken } from "./userAPI";
import getBackendURL from "../utils/getBackendURL";
import { isPwa } from "../utils/PWAUtils";

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
  mediaFilter?: string;
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
      mediaFilter,
    },
  ] = queryKey;

  const queryParams: QueryKeyParams = {
    parent,
    search,
    sortBy,
    limit,
    trashMode,
    mediaMode,
    mediaFilter,
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

  const url = `${getBackendURL()}/file-service/download/${fileID}`;

  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = url;
  link.setAttribute("type", "hidden");
  link.setAttribute("download", "true");
  link.click();
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
  const url = `${getBackendURL()}/file-service/public/download/${fileID}/${tempToken}`;

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

export const moveFileAPI = async (fileID: string, parentID: string) => {
  const response = await axios.patch(`/file-service/move`, {
    id: fileID,
    parentID,
  });
  return response.data;
};

export const moveMultiAPI = async (items: any, parentID: string) => {
  const response = await axios.patch(`/file-service/move-multi`, {
    items,
    parentID,
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
