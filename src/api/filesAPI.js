import axios from "../axiosInterceptor";

export const getFilesList = async ({ queryKey, pageParam }) => {
  console.log("quer", queryKey, pageParam);
  const [_key, { parent, search, sortBy, limit }] = queryKey;
  const response = await axios.get(
    `/file-service/list?parent=${parent}&sortby=${sortBy}&search=${search}&limit=${limit}`
  );
  return response.data;
};
