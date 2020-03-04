import axios from "axios";
import env from "../enviroment/envFrontEnd";

const currentURL = env.url;

export const setStorage = (info) => ({
    type: "SET_STORAGE",
    info
})

export const startSetStorage = () => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        axios.get(currentURL +`/storage-service/info`, config).then((results) => {

            dispatch(setStorage(results.data))
            
        }).catch((err) => {
            console.log(err)
        })

    }

}