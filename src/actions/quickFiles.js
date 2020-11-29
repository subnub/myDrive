import axios from "../axiosInterceptor";
import env from "../enviroment/envFrontEnd";
import mobilecheck from "../utils/mobileCheck";

export const setQuickFiles = (files) => ({
    type: "SET_QUICK_FILES",
    files
})

export const startSetQuickFiles = () => {

    return (dispatch) => {

        if (!env.googleDriveEnabled) {

            axios.get(`/file-service/quick-list`).then((results) => {
        
                //dispatch(setQuickFiles(results.data)) TEMP DISABLED FOR GOOGLE API
    
                let mongoData = results.data;
                
                const isMobile = mobilecheck();

                if (mongoData.length > 10 && !isMobile) {
                    mongoData = mongoData.slice(0, 10);
                } else if (mongoData.length > 2 && isMobile) {
                    mongoData = mongoData.slice(0, 2);
                }

                dispatch(setQuickFiles(mongoData))
    
            }).catch((err) => {
                console.log(err)
            })
        } else {

             // Temp Google Drive API
             axios.get(`/file-service-google-mongo/quick-list`).then((results) => {

                let combinedData = results.data;

                const isMobile = mobilecheck();

                if (combinedData.length > 10 && !isMobile) {
                    combinedData = combinedData.slice(0, 10);
                } else if (combinedData.length > 2 && isMobile) {
                    combinedData = combinedData.slice(0, 2);
                }

                dispatch(setQuickFiles(combinedData))
    
            }).catch((err) => {
                console.log(err)
            })
            
        }
    }
}

export const addQuickFile = (file) => ({
    type: "ADD_QUICK_FILE",
    file
})