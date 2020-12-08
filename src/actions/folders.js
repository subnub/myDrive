import {startSetQuickFiles} from "./quickFiles";
import env from "../enviroment/envFrontEnd";
import Swal from "sweetalert2";
import {addNewFolderTreeID, addDeleteFolderTreeID, removeDeleteFolderTreeID, addRenameFolderTreeID, setFirstLoadDetailsFolderTree} from "./folderTree"
import { startResetCache } from "./files";
import uuid from "uuid";
import axios from "../axiosInterceptor";

export const addFolder = (folder) => ({
    type: "ADD_FOLDER",
    folder
})

export const startAddFolder = (name, owner, parent, parentList, isGoogle=false) => {

    return (dispatch) => {

        if (env.uploadMode === '') {
            console.log("No Storage Accounts!");
            Swal.fire({
                icon: 'error',
                title: 'No Storage Accounts Active',
                text: 'Go to settings to add a storage account',
              })
            return;
        }

        if (name.length === 0) {
            return;
        }


        const storageType = env.uploadMode;

        let body = {name, parent, owner, parentList};

        if (storageType === "s3") body = {...body, personalFolder: true}

        // TEMP FIX THIS
        const url = storageType === "drive" ? "/folder-service-google/upload" : "/folder-service/upload";

        axios.post(url, body).then((response) => {

            const folder = response.data;

            dispatch(addFolder(folder))
            dispatch(addNewFolderTreeID(folder._id, folder))
            dispatch(startResetCache());

            if (parent === "/") dispatch(setFirstLoadDetailsFolderTree({status: "RESET", resetToken: uuid.v4()}));

        }).catch((err) => {
            console.log(err)
        })
    }
}

export const setFolders = (folders) => ({
    type: "SET_FOLDERS",
    folders
})

export const startSetFolders = (parent = "/", sortby="DEFAULT", search="", isGoogle=false, storageType="DEFAULT") => {

    return (dispatch) => {

        dispatch(setFolders([]))

        if (isGoogle) {
            
            axios.get(`/folder-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}`).then((results) => {
                const googleList = results.data;
                dispatch(setFolders(googleList)) 
            }).catch((err) => {
                console.log(err)
            })
        } else if (env.googleDriveEnabled && parent === "/") {

             // Temp Google Drive API
             axios.get(`/folder-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}`).then((results) => {
                const googleMongoList = results.data;
                dispatch(setFolders(googleMongoList))
              
            }).catch((err) => {
                console.log(err)
            })

        } else {

            axios.get(`/folder-service/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}`).then((response) => {
           
                const folders = response.data;
                dispatch(setFolders(folders)) //DISABLED TEMP
    
            }).catch((err) => {
                console.log(err);
            })
        }
    }
}

export const removeFolder = (id) => ({
    type: "REMOVE_FOLDER",
    id
})

export const startRemoveFolder = (id, parentList, isGoogle=false, parent, personalFolder=false) => {

    return (dispatch) => {

        const data = {id, parentList};

        const url = isGoogle ? `/folder-service-google/remove` : personalFolder ? `/folder-service-personal/remove` : `/folder-service/remove`;

        axios.delete(url, {
            data
        }).then((response) => {
           
            dispatch(removeFolder(id));
            dispatch(startSetQuickFiles())
            dispatch(addDeleteFolderTreeID(id, {_id:id}))
            dispatch(startResetCache());

            if (parent === "/") dispatch(setFirstLoadDetailsFolderTree({status: "RESET", resetToken: uuid.v4()}));

        }).catch((err) => {
            console.log(err);
        })
    }
}

export const editFolder = (id, folder) => ({
    type: "EDIT_FOLDER",
    id, 
    folder
})

export const startRenameFolder = (id, title, isGoogle=false, parent) => {
    
    return (dispatch) => {

        const data = {id, title}

        const url = isGoogle ? "/folder-service-google/rename" : "/folder-service/rename";
 
        axios.patch(url, data).then((response) => {

            dispatch(editFolder(id, {name: title}))
            dispatch(addRenameFolderTreeID(id, {_id:id, name: title}));
            dispatch(startResetCache());

            if (parent === "/") dispatch(setFirstLoadDetailsFolderTree({status: "RESET", resetToken: uuid.v4()}));

        }).catch((err) => {
            console.log(err)
        })   
    }
}
