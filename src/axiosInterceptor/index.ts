import axios from "axios";
import uuid from "uuid";
import getBackendURL from "../utils/getBackendURL";

let browserIDCheck = localStorage.getItem("browser-id");

const sleep = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 150);
  });
};

const axiosRetry = axios.create({ baseURL: getBackendURL() });
const axiosNoRetry = axios.create({ baseURL: getBackendURL() });
const axios3 = axios.create({ baseURL: getBackendURL() });

axiosRetry.interceptors.request.use(
  (config) => {
    if (!browserIDCheck) {
      browserIDCheck = uuid.v4();
      localStorage.setItem("browser-id", browserIDCheck);
    }

    config.headers.uuid = browserIDCheck;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosRetry.interceptors.response.use(
  (response) => {
    //console.log("axios interceptor successful")
    return response;
  },
  (error) => {
    return new Promise((resolve, reject) => {
      let originalRequest = error.config;

      if (error.response.status !== 401) {
        return reject(error);
      }

      if (originalRequest.ran === true) {
        //console.log("original request ran", error.config.url);
        return reject(error);
      }

      if (error.config.url === "/user-service/get-token") {
        //console.log("error url equal to refresh token route")
        return reject();
      }

      if (!browserIDCheck) {
        browserIDCheck = uuid.v4();
        localStorage.setItem("browser-id", browserIDCheck);
      }

      axiosNoRetry
        .post(
          "/user-service/get-token",
          {},
          {
            headers: {
              uuid: browserIDCheck,
            },
          }
        )
        .then((cookieResponse) => {
          // We need to sleep before requesting again, if not I believe
          // The old request will still be open and it will not make a
          // Brand new request sometimes, so it will log users out
          // But adding a sleep function seems to fix this.
          return sleep();
        })
        .then((sleepres) => {
          return axios3(originalRequest);
        })
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          //console.log("error");
          return reject(error);
        });
    });
  }
);

export default axiosRetry;
