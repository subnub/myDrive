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

// POST

export const loginAPI = async (email: string, password: string) => {
  const response = await axios.post("/user-service/login", {
    email,
    password,
  });
  return response.data;
};
