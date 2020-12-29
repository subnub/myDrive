import axios from "../axiosInterceptor";
import env from "../enviroment/envFrontEnd";

export const setStorage = (info) => ({
    type: "SET_STORAGE",
    info
})

export const startSetStorage = () => {

    return (dispatch) => {

        return;

        if (env.disableStorage === "true") {
            return;
        }

        axios.get(`/storage-service/info`).then((results) => {

            dispatch(setStorage(results.data))
            
        }).catch((err) => {
            console.log(err)
        })

    }

}