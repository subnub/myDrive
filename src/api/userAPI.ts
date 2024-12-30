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

export const logoutAPI = async () => {
  const response = await axios.post("/user-service/logout");
  return response.data;
};

export const logoutAllAPI = async () => {
  const response = await axios.post("/user-service/logout-all");
  return response.data;
};

export const getAccessToken = async (uuid: string) => {
  const response = await axios.post("/user-service/get-token", undefined, {
    headers: {
      uuid,
    },
  });
  return response.data;
};

// PATCH

export const changePasswordAPI = async (
  oldPassword: string,
  newPassword: string
) => {
  const response = await axios.patch("/user-service/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const resendVerifyEmailAPI = async () => {
  const response = await axios.patch("/user-service/resend-verify-email");
  return response.data;
};

export const verifyEmailAPI = async (emailToken: string) => {
  const response = await axios.patch("/user-service/verify-email", {
    emailToken,
  });
  return response.data;
};

export const sendPasswordResetAPI = async (email: string) => {
  const response = await axios.patch("/user-service/send-password-reset", {
    email,
  });
  return response.data;
};

export const resetPasswordAPI = async (
  password: string,
  passwordToken: string
) => {
  const response = await axios.patch("/user-service/reset-password", {
    passwordToken,
    password,
  });
  return response.data;
};
