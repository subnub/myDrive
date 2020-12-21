import axios from 'axios';
import uuid from "uuid";

let browserIDCheck = localStorage.getItem("browser-id");

const sleep = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 150);
  })
}

const axiosRetry = axios.create();
const axiosNoRetry = axios.create();
const axios3 = axios.create();

axiosRetry.interceptors.request.use((config) => {

  if (!browserIDCheck) {
    browserIDCheck = uuid.v4();
    localStorage.setItem("browser-id", browserIDCheck);
  };

  config.headers.uuid = browserIDCheck;

  return config;

}, (error) => {

  return Promise.reject(error);

})

axiosRetry.interceptors.response.use((response) => {
  //console.log("axios interceptor successful")
  return response;
}, (error) => {

  return new Promise((resolve, reject) => {

    //console.log("request interceptor failed", error.config.url);

    let originalRequest = error.config;

    if (error.response.status !== 401) {
        //console.log("error does not equal 401");
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
    };
    
    axiosNoRetry.post("/user-service/get-token", {}, {headers: {
      "uuid" : browserIDCheck 
    }}).then((cookieResponse) => {
      
      // We need to sleep before requesting again, if not I believe 
      // The old request will still be open and it will not make a 
      // Brand new request sometimes, so it will log users out
      // But adding a sleep function seems to fix this.
      return sleep("sleepy boi");

    }).then((sleepres) => {

      return axios3(originalRequest);

    }).then((response) => {

      resolve(response)

    }).catch((e) => {

      //console.log("error");
      return reject(error);

    })
  })

})

// axios.interceptors.response.use( (response) => {

//     console.log("axios interceptor")
//   // Return a successful response back to the calling service
//     return response;
// }, (error) => {

//     const originalRequest = error.config;

//     if (originalRequest.ran) {
//       console.log("Request already ran");
//       return Promise.reject(error);
//     }

//     console.log("axios interceptor failed first request")
//   // Return any error which is not due to authentication back to the calling service
//   if (error.response.status !== 401) {
//       console.log("error does not equal 401");
//     return new Promise((resolve, reject) => {
//       reject(error);
//     });
//   }

//   // Logout user if token refresh didn't work or user is disabled

//   console.log("error url", error.config.url);

//   if (error.config.url === "/user-service/get-token") {
//       console.log("error url equal to refresh token route")
//     return new Promise((resolve, reject) => {
//       reject(error);
//     });
//   }

//   // Try request again with new token

//   // return new Promise((resolve, reject) => {
//   // })

//   return axios.post("/user-service/get-token").then((cookieResponse) => {

//     console.log("cookie status", cookieResponse.status);

//     if (cookieResponse.status === 201) {
//         console.log("cookie response", cookieResponse.data);

//         originalRequest.ran = true;
//         return axios(originalRequest);

//     } else {
//         return Promise.reject(error);
//     }
//   })
//   // .catch((cookieError) => {
//   //   console.log("cookieError", cookieError);
//   //   return Promise.reject(error);
//   // })
  
// });

export default axiosRetry;
