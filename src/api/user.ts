import axios from "../axiosInterceptor";

export const getUserToken = async () => {
  const response = await axios.post("/user-service/get-token");
  response.data;
};
