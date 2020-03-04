import axios from "axios";
import env from "../enviroment/envFrontEnd";

const currentURL = env.url;

export const setParent = (parent="/") => ({
    type: "SET_PARENT",
    parent
})

export const addParentList = (parent, name) => ({
    type: "ADD_PARENT_LIST",
    parent,
    name
})

export const setParentList = (parentList, parentNameList) => ({
    type: "SET_PARENT_LIST",
    parentList,
    parentNameList
})

export const startSetParentList = (id) => {

    return (dispatch) => {

        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        }

        axios.get(currentURL+`/folder-service/subfolder-list/?id=${id}`, config).then((response) => {

            const parentList = response.data.folderIDList;
            const parentNameList = response.data.folderNameList;

            dispatch(setParentList(parentList, parentNameList))
            
        }).catch((err) => {
            console.log(err);
        })

    }
}

export const adjustParentList = (parentList, parentNameList) => ({
    type: "ADJUST_PARENT_LIST",
    parentList, 
    parentNameList
})

export const startAdjustParentList = (id, parentList, parentNameList) => {

    return (dispatch) => {

        const adjustedParentList = [];
        const adjustedParentNameList = [];

        for (let i = 0; i < parentList.length; i++) {

            const currentID = parentList[i];
            const currentName = parentNameList[i];

            adjustedParentList.push(currentID)
            adjustedParentNameList.push(currentName)

            if (currentID === id) {
                break;
            }
        }

        dispatch(adjustParentList(adjustedParentList, adjustedParentNameList));

    }
}

export const addParentNameList = (name) => ({
    type: "ADD_PARENT_NAME_LIST",
    name
})

export const resetParentList = () => ({
    type: "RESET_PARENT_LIST"
})