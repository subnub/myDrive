import axios from "../axiosInterceptor";

// GET

export const getUserToken = async () => {
  const response = await axios.post("/user-service/get-token");
  response.data;
};

export const getUserAPI = async () => {
  const response = await axios.get("/user-service/user");
  return response.data;
};

export const getUserDetailedAPI = async () => {
  const response = await axios.get("/user-service/user-detailed");
  return response.data;
};

// POST

export const loginAPI = async (email: string, password: string) => {
  const response = await axios.post("/user-service/login", {
    email,
    password,
  });
  return response.data;
};

export const createAccountAPI = async (email: string, password: string) => {
  const response = await axios.post("/user-service/create", {
    email,
    password,
  });
  return response.data;
};
