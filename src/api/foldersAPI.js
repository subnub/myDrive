import axios from "../axiosInterceptor";

export const getFoldersList = async ({ queryKey }) => {
  const [_key, { parent, search, sortBy, limit }] = queryKey;
  const response = await axios.get(
    `/folder-service/list?parent=${parent}&sortby=${sortBy}&search=${search}&limit=${limit}`
  );
  return response.data;
};
