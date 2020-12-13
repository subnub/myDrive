import {addUpload, editUpload, cancelUpload} from "./uploads";
import {loadMoreItems, setLoading, setLoadingMoreItems} from "./main"
import {resetSelected} from "./selectedItem";
import {addQuickFile, startSetQuickFiles, setQuickFiles} from "./quickFiles";
import {startSetStorage} from "./storage"
import uuid from "uuid";
import axios from "../axiosInterceptor";
import axiosNonInterceptor from "axios";
import env from "../enviroment/envFrontEnd";
import Swal from "sweetalert2";
import mobileCheck from "../utils/mobileCheck";
import { setFolders } from "./folders";
import reduceQuickItemList from "../utils/reduceQuickItemList";
const http = require('http');
const https = require('https');

let cachedResults = {}

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

export const startSetFileAndFolderItems = (historyKey, parent="/", sortby="DEFAULT", search="", isGoogle=false, storageType="DEFAULT", folderSearch=false) => {

    return (dispatch) => {

        if (cachedResults[historyKey]) {
          
            const {fileList, folderList} = cachedResults[historyKey];

            dispatch(setFiles(fileList));
            dispatch(setFolders(folderList));
            dispatch(setLoading(false))

            if (fileList.length === limit) {
                dispatch(loadMoreItems(true))
            } else {
                dispatch(loadMoreItems(false))
            }

            delete cachedResults[historyKey];

            return;
        }

        //isGoogle = env.googleDriveEnabled;
    
        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit);
    
        let fileURL = "";
        let folderURL = "";

        if (search && search !== "") {

            if (env.googleDriveEnabled) {
                fileURL = `/file-service-google-mongo/list?search=${search}`;
                folderURL = `/folder-service-google-mongo/list?search=${search}`;
            } else {
                fileURL = `/file-service/list?search=${search}`;
                folderURL = `/folder-service/list?search=${search}`;
            }


        } else {

            fileURL = 
                isGoogle ? `/file-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}` : 
                (env.googleDriveEnabled && parent === "/") ? `/file-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}` : 
                `/file-service/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}`
            
            folderURL = isGoogle ? `/folder-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}` :
                (env.googleDriveEnabled && parent === "/") ? `/folder-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}` :
                `/folder-service/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}`;
            
        }

        dispatch(setFiles([]))
        dispatch(setFolders([]))
        dispatch(setLoading(true))
        
        const itemList = [axios.get(fileURL), axios.get(folderURL)];
    
        Promise.all(itemList).then((values) => {
    
            const fileList = values[0].data;
            const folderList = values[1].data;

            dispatch(setFiles(fileList));
            dispatch(setFolders(folderList));
            dispatch(setLoading(false))

            if (fileList.length === limit) {
                dispatch(loadMoreItems(true))
            } else {
                dispatch(loadMoreItems(false))
            }
    
            cachedResults[historyKey] = {fileList, folderList}

        }).catch((e) => {
            console.log("Get All Items Error", e);
        })
    }
}

export const startSetAllItems = (clearCache, parent="/", sortby="DEFAULT", search="", isGoogle=false, storageType="DEFAULT") => {

    return (dispatch) => {

        if (clearCache) cachedResults = {};

        //isGoogle = env.googleDriveEnabled;

        if (cachedResults[parent]) {

            const {fileList, folderList, quickItemList} = cachedResults[parent];

            dispatch(setFiles(fileList));
            dispatch(setFolders(folderList));
            dispatch(setQuickFiles(quickItemList));
            dispatch(setLoading(false))

            if (fileList.length === limit) {
                dispatch(loadMoreItems(true))
            } else {
                dispatch(loadMoreItems(false))
            }

            cachedResults = {}
            cachedResults[parent] = {fileList, folderList, quickItemList}

            return;
        }
    
        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)
    
        const fileURL = 
        isGoogle ? `/file-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}` : 
        (env.googleDriveEnabled && parent === "/") ? `/file-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}` : 
        `/file-service/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}`
    
        const folderURL = isGoogle ? `/folder-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}` :
        (env.googleDriveEnabled && parent === "/") ? `/folder-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}` :
        `/folder-service/list?parent=${parent}&sortby=${sortby}&search=${search}&storageType=${storageType}`;
    
        const quickItemsURL = !env.googleDriveEnabled ? `/file-service/quick-list` : `/file-service-google-mongo/quick-list`;

        dispatch(setFiles([]))
        dispatch(setFolders([]))
        dispatch(setQuickFiles([]))
        dispatch(setLoading(true))

        const itemList = [axios.get(fileURL), axios.get(folderURL), axios.get(quickItemsURL)];
    
        Promise.all(itemList).then((values) => {
    
            const fileList = values[0].data;
            const folderList = values[1].data;
            const quickItemList = reduceQuickItemList(values[2].data);

            dispatch(setFiles(fileList));
            dispatch(setFolders(folderList));
            dispatch(setQuickFiles(quickItemList));
            dispatch(setLoading(false))

            if (fileList.length === limit) {
                dispatch(loadMoreItems(true))
            } else {
                dispatch(loadMoreItems(false))
            }

            cachedResults = {}
            cachedResults[parent] = {fileList, folderList, quickItemList}
            
        }).catch((e) => {
            console.log("Get All Items Error", e);
        })
    }
}

export const startSetFiles = (parent="/", sortby="DEFAULT", search="", isGoogle=false, storageType="DEFAULT") => {

    return (dispatch) => {

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        dispatch(setFiles([]))
        dispatch(setLoading(true))

        if (env.googleDriveEnabled) {

            axios.get(`/file-service-google/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}`).then((results) => {
                
                const googleList = results.data;
                //dispatch(loadMoreFiles(googleList))
                dispatch(setFiles(googleList))
                dispatch(setLoading(false))
               
                if (googleList.length === limit) {
                    dispatch(loadMoreItems(true))
                } else {
                    dispatch(loadMoreItems(false))
                }
                
            }).catch((err) => {
                console.log(err)
            })
        } else if (env.googleDriveEnabled && parent === "/") {

            // Temp Google Drive API
            axios.get(`/file-service-google-mongo/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}`).then((results) => {
                // console.log("Google Data", results.data.data.files);
                // const convertedList = convertDriveListToMongoList(results.data.data.files);
                // console.log("Converted List", convertedList);
                const googleMongoList = results.data;
                //dispatch(loadMoreFiles(googleList))
                //dispatch(setLoading(true))
                dispatch(setFiles(googleMongoList))
                dispatch(setLoading(false))

                if (results.data.length === limit) {
                    dispatch(loadMoreItems(true))
                } else {
                    dispatch(loadMoreItems(false))
                }
                
            }).catch((err) => {
                console.log(err)
            })
        } else {

            axios.get(`/file-service/list?parent=${parent}&sortby=${sortby}&search=${search}&limit=${limit}&storageType=${storageType}`).then((results) => {
   
                const mongoData = results.data;
                //dispatch(setLoading(true))
                dispatch(setFiles(mongoData))
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
}

export const loadMoreFiles = (files) => ({
    type: "LOAD_MORE_FILES",
    files
})

export const startLoadMoreFiles = (parent="/", sortby="DEFAULT", search="", startAtDate, startAtName, pageToken, isGoogle=false) => {

    return (dispatch) => {

        dispatch(setLoadingMoreItems(true));

        let limit = window.localStorage.getItem("list-size") || 50
        limit = parseInt(limit)

        if (isGoogle) {

             // Temp Google Drive API
            axios.get(`/file-service-google/list?limit=${limit}&parent=${parent}&sortby=${sortby}&search=${search}&startAt=${true}&startAtDate=${startAtDate}&startAtName=${startAtName}&pageToken=${pageToken}`).then((results) => {
            
                dispatch(loadMoreFiles(results.data))
        
                if (results.data.length !== limit) {
    
                    dispatch(loadMoreItems(false))
    
                } else {
                    dispatch(loadMoreItems(true))
                }
             
                dispatch(setLoadingMoreItems(false));
                //dispatch(setLoading(false))

            }).catch((err) => {
                console.log(err)
            })

        } else {

            axios.get(`/file-service/list?limit=${limit}&parent=${parent}&sortby=${sortby}&search=${search}&startAt=${true}&startAtDate=${startAtDate}&startAtName=${startAtName}`).then((results) => {
            
                //console.log("load more files result", results.data.length)

                dispatch(loadMoreFiles(results.data))
    
                if (results.data.length !== limit) {
    
                    dispatch(loadMoreItems(false))
    
                } else {
                    dispatch(loadMoreItems(true))
                }
                
                // dispatch(setLoading(false))
               dispatch(setLoadingMoreItems(false));
    
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}

export const addFile = (file) => ({
    type: "ADD_FILE",
    file
})

export const startAddFile = (uploadInput, parent, parentList, storageSwitcherType) => {

    return (dispatch, getState) => {

        if (env.uploadMode === '') {
            console.log("No Storage Accounts!");
            Swal.fire({
                icon: 'error',
                title: 'No Storage Accounts Active',
                text: 'Go to settings to add a storage account',
              })
            return;
        }
    
        // Store the parent, incase it changes.
        const prevParent = getState().parent.parent;

        for (let i = 0; i < uploadInput.files.length; i++) {
            const currentFile = uploadInput.files[i];
            const currentID = uuid();

            const CancelToken = axiosNonInterceptor.CancelToken;
            const source = CancelToken.source();

            const httpAgent = new http.Agent({ keepAlive: true });
            const httpsAgent = new https.Agent({ keepAlive: true });

            const config = {
                headers: {
                httpAgent,
                httpsAgent,
                'Content-Type': 'multipart/form-data',
                'Transfere-Encoding': "chunked",
                },
                onUploadProgress: (progressEvent) => {

                    const currentProgress = Math.round(((progressEvent.loaded / progressEvent.total) * 100));

                    if (currentProgress !== 100) {

                        dispatch(editUpload(currentID, currentProgress))
                    }
                },
                cancelToken: source.token,
            };

            dispatch(addUpload({id: currentID, progress: 0, name: currentFile.name, completed: false, source, canceled: false, size: currentFile.size}))

            const storageType = env.uploadMode;

            const data = new FormData();
      
            data.append('filename', currentFile.name);
            data.append("parent", parent)
            data.append("parentList", parentList)
            data.append("currentID", currentID)
            data.append("size", currentFile.size)
            if (storageType === "s3") data.append("personal-file", true);
            data.append('file', currentFile);


            const url = storageType === "drive" ? '/file-service-google/upload' : storageType === "s3" ? '/file-service-personal/upload' : '/file-service/upload';

            axios.post(url, data, config)
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

                cachedResults = {};
                
            })
            .catch(function (error) {
                console.log(error);
                dispatch(cancelUpload(currentID))
            });
    
        }
    }
}

export const removeFile = (id) => ({
    type: "REMOVE_FILE",
    id
})

export const startRemoveFile = (id, isGoogle=false, isPersonal=false) => {

    return (dispatch) => {

        const data = {id}

        if (isGoogle) {

            axios.delete("/file-service-google/remove", {
                data
            }).then(() => {
                dispatch(removeFile(id))
                dispatch(startSetStorage())
                dispatch(startSetQuickFiles());

                cachedResults = {};

            }).catch((err) => {
                console.log(err)
            })

        } else {

            const url = !isPersonal ? "/file-service/remove" : "/file-service-personal/remove";

            axios.delete(url, {
                data
            }).then(() => {
                dispatch(removeFile(id))
                dispatch(startSetStorage())
                dispatch(startSetQuickFiles());

                cachedResults = {};

            }).catch((err) => {
                console.log(err)
            })
        }
    }
}


export const startRenameFile = (id, title, isGoogle=false) => {
    
    return (dispatch) => {

        const data = {id, title}

        if (isGoogle) {

            axios.patch("/file-service-google/rename", data).then(() => {

                dispatch(editFile(id, {filename: title}))

                cachedResults = {};
    
            }).catch((err) => {
                console.log(err)
            })
        } else {

            axios.patch("/file-service/rename", data).then(() => {

                dispatch(editFile(id, {filename: title}))
    
                cachedResults = {};

            }).catch((err) => {
                console.log(err)
            })
        }
        
    }
}

export const startResetCache = () => {

    return (dispatch) => {

        cachedResults = {};
    }
}
