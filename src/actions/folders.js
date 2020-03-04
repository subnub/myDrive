import {startSetQuickFiles} from "./quickFiles";
import env from "../enviroment/envFrontEnd";
const axios = require("axios");

const currentURL = env.url;

export const addFolder = (folder) => ({
    type: "ADD_FOLDER",
    folder
})

export const startAddFolder = (name, owner, parent, parentList) => {

    return (dispatch) => {

        if (name.length === 0) {
            return;
        }

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        const body = {name, parent, owner, parentList};

        axios.post(currentURL+"/folder-service/upload", body, config).then((response) => {

            const folder = response.data;

            dispatch(addFolder(folder))

        }).catch((err) => {
            console.log(err)
        })
    }
}

export const setFolders = (folders) => ({
    type: "SET_FOLDERS",
    folders
})

export const startSetFolders = (parent = "/", sortby="DEFAULT", search="") => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        dispatch(setFolders([]))

        axios.get(currentURL+`/folder-service/list?parent=${parent}&sortby=${sortby}&search=${search}`, config).then((response) => {
           
            const folders = response.data;
            dispatch(setFolders(folders))

        }).catch((err) => {
            console.log(err);
        })
    }
}

export const removeFolder = (id) => ({
    type: "REMOVE_FOLDER",
    id
})

export const startRemoveFolder = (id, parentList) => {

    return (dispatch) => {

        const data = {id, parentList};

        const headers = {'Authorization': "Bearer " + window.localStorage.getItem("token")}

        axios.delete(currentURL+`/folder-service/remove`, {
            headers,
            data
        }).then((response) => {
           
            dispatch(removeFolder(id));
            dispatch(startSetQuickFiles())

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

export const startRenameFolder = (id, title) => {
    
    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        const data = {id, title}

        axios.patch(currentURL+"/folder-service/rename", data, config).then((response) => {

            dispatch(editFolder(id, {name: title}))

        }).catch((err) => {
            console.log(err)
        })   
    }
}
