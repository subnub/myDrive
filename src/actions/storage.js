import axios from "../axiosInterceptor";
import env from "../enviroment/envFrontEnd";

const currentURL = env.url;

export const setStorage = (info) => ({
    type: "SET_STORAGE",
    info
})

export const startSetStorage = () => {

    return (dispatch) => {

        if (env.disableStorage === "true") {
            return;
        }

        axios.get(currentURL +`/storage-service/info`).then((results) => {

            dispatch(setStorage(results.data))
            
        }).catch((err) => {
            console.log(err)
        })

    }

}