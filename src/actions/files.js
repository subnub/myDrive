import {addUpload, editUpload} from "./uploads";
import {loadMoreItems, setLoading} from "./main"
import {resetSelected} from "./selectedItem";
import {addQuickFile, startSetQuickFiles} from "./quickFiles";
import {startSetStorage} from "./storage"
import uuid from "uuid";
import axios from "axios";
import env from "../enviroment/envFrontEnd";
const http = require('http');
const https = require('https');

const currentURL = env.url;

export const setFiles = (files) => ({
    type: "SET_FILES",
    files
})

export const editFile = (id, file) => ({
    type: "EDIT_FILE",
    id,
    file
})

export const editFileMetadata = (id, metadata) => ({
    type: "EDIT_FILE_METADATA", 
    id, 
    metadata
})

export const startSetFiles = (parent="/", sortby="DEFAULT", search="") => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        dispatch(setFiles([]))

        axios.get(currentURL +`/file-service/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}`, config).then((results) => {
   
            dispatch(setLoading(true))
            dispatch(setFiles(results.data))
            dispatch(setLoading(false))

            if (results.data.length === limit) {
                dispatch(loadMoreItems(true))
            } else {
                dispatch(loadMoreItems(false))
            }

        }).catch((err) => {
            console.log(err)
        })
    }
}

export const loadMoreFiles = (files) => ({
    type: "LOAD_MORE_FILES",
    files
})

export const startLoadMoreFiles = (parent="/", sortby="DEFAULT", search="", startAtDate, startAtName) => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        axios.get(currentURL +`/file-service/list?limit=${limit}&parent=${parent}&sortby=${sortby}&search=${search}&startAt=${true}&startAtDate=${startAtDate}&startAtName=${startAtName}`, config).then((results) => {
            console.log("load more results", results);

            if (results.data.length !== limit) {

                dispatch(loadMoreItems(false))

            } else {
                dispatch(loadMoreItems(true))
            }

            dispatch(loadMoreFiles(results.data))

        }).catch((err) => {
            console.log(err)
        })
    }
}

export const addFile = (file) => ({
    type: "ADD_FILE",
    file
})

export const startAddFile = (uploadInput, parent, parentList) => {

    return (dispatch, getState) => {
    
        // Store the parent, incase it changes.
        const prevParent = getState().parent.parent;

        for (let i = 0; i < uploadInput.files.length; i++) {
            const currentFile = uploadInput.files[i];
            const currentID = uuid();

            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();

            const httpAgent = new http.Agent({ keepAlive: true });
            const httpsAgent = new https.Agent({ keepAlive: true });

            const config = {
                headers: {'Authorization': "Bearer " + window.localStorage.getItem("token"),
                httpAgent,
                httpsAgent,
                'Content-Type': 'multipart/form-data',
                'Transfere-Encoding': "chunked"},
                onUploadProgress: (progressEvent) => {

                    const currentProgress = Math.round(((progressEvent.loaded / progressEvent.total) * 100));

                    if (currentProgress !== 100) {

                        dispatch(editUpload(currentID, currentProgress))
                    }
                },
                cancelToken: source.token
            };

            dispatch(addUpload({id: currentID, progress: 0, name: currentFile.name, completed: false, source, canceled: false}))

            const data = new FormData();
      
            data.append('filename', currentFile.name);
            data.append("parent", parent)
            data.append("parentList", parentList)
            data.append("currentID", currentID)
            data.append("size", currentFile.size)
            data.append('file', currentFile);
    
            axios.post(currentURL +'/file-service/upload', data, config)
            .then(function (response) {

                const currentParent =  getState().parent.parent;
                // This can change by the time the file uploads
                if (prevParent === currentParent) {
                    dispatch(addFile(response.data));
                }

                dispatch(addQuickFile(response.data))
                dispatch(editUpload(currentID, 100, true))
                dispatch(resetSelected())
                dispatch(startSetStorage())
                
            })
            .catch(function (error) {
                console.log(error);
            });
    
        }
    }
}

export const removeFile = (id) => ({
    type: "REMOVE_FILE",
    id
})

export const startRemoveFile = (id) => {

    return (dispatch) => {

        const headers = {'Authorization': "Bearer " + window.localStorage.getItem("token")};
        const data = {id}

        axios.delete(currentURL+"/file-service/remove", {
            headers,
            data
        }).then(() => {
            dispatch(removeFile(id))
            dispatch(startSetStorage())
            dispatch(startSetQuickFiles());
        }).catch((err) => {
            console.log(err)
        })
    }
}


export const startRenameFile = (id, title) => {
    
    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        const data = {id, title}

        axios.patch(currentURL+"/file-service/rename", data, config).then(() => {

            dispatch(editFile(id, {filename: title}))

        }).catch((err) => {
            console.log(err)
        })
        
    }
}
