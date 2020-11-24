import axios from "../axiosInterceptor";

let cachedResults = {};

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

export const startSetParentList = (id, isGoogle=false) => {

    return (dispatch) => {

        if (cachedResults[id]) {

            const {_id, name} = cachedResults[id];

            const parentList = ["/", _id];
            const parentNameList = ["Home", name];

            dispatch(setParentList(parentList, parentNameList));

            delete cachedResults[id];

            return;
        }

        const URL = isGoogle ? `/folder-service-google/info/${id}` : `/folder-service/info/${id}`;

        dispatch(setParentList(["/", ""], ["Home", ""]))

        axios.get(URL).then((response) => {

            const parentList = ["/", response.data._id];
            const parentNameList = ["Home", response.data.name];

            dispatch(setParentList(parentList, parentNameList));

            cachedResults[id] = {_id: response.data._id, name: response.data.name};

        }).catch((err) => {
            console.log("Error getting folder info for parent list", err);
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

export const startResetParentList = () => {

    return (dispatch) => {

        cachedResults = {};
        dispatch(resetParentList());
    }
}

export const resetParentList = () => ({
    type: "RESET_PARENT_LIST"
})