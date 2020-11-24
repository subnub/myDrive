import axios from 'axios';
import createAuthRefreshInterceptor from "axios-auth-refresh";

// const refreshAuthLogic = failedRequest => axios.post("/user-service/get-token").then(tokenRefreshResponse => {
    
//     return Promise.resolve();
// }).catch(() => {
//     return Promise.reject(failedRequest);
// });
 
// // Instantiate the interceptor (you can chain it as it returns the axios instance)
// createAuthRefreshInterceptor(axios, refreshAuthLogic);

// const client = axios.create();
// axiosRetry(client, {
//   retries: 0,
// })

//axiosRetry(axios, { retries: 3 });

// const getNewToken = () => {
//   return new Promise((resolve, reject) => {
//       axios.post("/user-service/get-token").then((response) => {
//         console.log("get token response");
//         resolve();
//       }).catch((e) => {
//         resolve();
//       })
//   })
// }

// axios.interceptors.response.use(null, (error) => {
//   if (error.config && error.response && error.response.status === 401 && !error._tried) {
//     return getNewToken().then(() => {
//       console.log("got new token");
//       error._tried = true;
//       return axios.request(error.config);
//     })
//   }

//   return Promise.reject(error);
// });

const axiosNoRetry = axios.create();
const axiosRetry = axios.create();
const axios3 = axios.create();

const sleep = (sleepybio) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(sleepybio);
    }, 100);
  })
}

const sleep2 = (sleepybio) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(sleepybio);
    }, 1500);
  })
}

axiosRetry.interceptors.response.use((response) => {
  console.log("axios interceptor successful")
  return response;
}, (error) => {

  return new Promise((resolve, reject) => {

    console.log("request interceptor failed", error.config.url);

    let originalRequest = error.config;

    if (originalRequest.ran === true) {
      console.log("original request ran", error.config.url);
      return reject(error);
    }
    
    if (error.config.url === "/user-service/get-token") {
          console.log("error url equal to refresh token route")
          return reject();
        }
    
    axiosNoRetry.post("/user-service/get-token").then((cookieResponse) => {
      
      console.log("sleeping")
      return sleep("sleepy boi");

    }).then((sleepres) => {

      console.log(sleepres);

      console.time("test");
      return axios3(originalRequest);

    }).then((response) => {

      console.timeEnd("test");

      console.log("axios 3");
      resolve(response)

    }).catch((e) => {

      console.log("error");
      return reject(error);

    })
  })

})

// axios.interceptors.response.use( (response) => {

//     console.log("axios interceptor")
//     return response;

// }, (error) => {

//     return new Promise((resolve, reject) => {

//       //axios.interceptors.response.eject(this);

//       const originalRequest = error.config;

//       if (originalRequest.ran === 3) {
//         console.log("Max retry count", error.config.url);
//         return reject(error);
//       } 

//       console.log("axios retry count", originalRequest.ran, originalRequest.ran === 3);

//       if (error.response.status !== 401) {
//         console.log("error does not equal 401");
//         return reject(error);
//       }

//       axiosNoRetry.post("/user-service/get-token").then((cookieResponse) => {

//         console.log("cookie status", cookieResponse.status);

//         if (cookieResponse.status === 201) {
      
//             originalRequest.ran = originalRequest.ran ? originalRequest.ran + 1 : 1;
//             //return axios(originalRequest);
//             //return resolve(axios(originalRequest));

//             return "value"

//         } else {
//             return reject(error);
//         }

//       }).then(() => {

//         axiosNoRetry(originalRequest).then((newRequest) => {
//             console.log("new request", newRequest.data);
//             resolve(newRequest)
//         }).catch((newError) => {
//           console.log("new request error", newError);
//           return reject(newError)
//         })

//       })

//     })

//     // const originalRequest = error.config;

//     // if (originalRequest.ran === 3) {
//     //   console.log("Max retry count", error.config.url);
//     //   return Promise.reject(error);
//     // }

//     // console.log("axios retry count", originalRequest.ran);

//     // if (error.response.status !== 401) {
//     //     console.log("error does not equal 401");
//     //   return new Promise((resolve, reject) => {
//     //     reject(error);
//     //   });
//     // }

//     // if (error.config.url === "/user-service/get-token") {
//     //     console.log("error url equal to refresh token route")
//     //   return new Promise((resolve, reject) => {
//     //     reject(error);
//     //   });
//     // }

//     // return axiosNoRetry.post("/user-service/get-token").then((cookieResponse) => {

//     //   console.log("cookie status", cookieResponse.status);

//     //   if (cookieResponse.status === 201) {
    
//     //       originalRequest.ran = originalRequest.ran ? originalRequest.ran + 1 : 1;
//     //       return axios(originalRequest);

//     //   } else {
//     //       return Promise.reject(error);
//     //   }

//     // })
// });

export default axiosRetry;
