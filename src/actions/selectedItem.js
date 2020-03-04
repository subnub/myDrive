import axios from "axios";
import env from "../enviroment/envFrontEnd";

const currentURL = env.url;

export const setSelectedItem = (selectedItem) => ({
    type: "SET_SELECTED_ITEM", 
    selectedItem
})

export const startSetSelectedItem = (id, file, fromQuickItems) => {

    return (dispatch) => {
        
        const config = {
            headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
        };

        const currentDate = Date.now();

        dispatch(setLastSelected(currentDate));
        
        if (!fromQuickItems) {
            dispatch(setSelected(id))
        } else {
            dispatch(setSelected("quick-"+id))
        }

        if (file) {
                
            axios.get(currentURL +`/file-service/info/${id}`, config).then((results) => {

                const {filename: name, length: size, uploadDate: date, parentName: location, metadata, _id: id} = results.data;

                dispatch(setSelectedItem({name, size, date, file, location, transcoded: metadata.transcoded, isVideo: metadata.isVideo, id, linkType: metadata.linkType, link: metadata.link}))
                
            }).catch((err) => {
                console.log(err)
            })

        } else {

            axios.get(currentURL +`/folder-service/info/${id}`, config).then((results) => {

                const {name, 0: size, createdAt: date, parentName: location} = results.data;

                dispatch(setSelectedItem({name, size, date, file, location}))
                
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}

export const editSelectedItem = (item) => ({
    type: "EDIT_SELECTED_ITEM",
    item
})

export const resetSelectedItem = () => ({
    type: "RESET_SELECTED_ITEM"
})

export const resetSelected = () => ({
    type: "RESET_SELECTED"
})

export const setLastSelected = (lastSelected) => ({
    type: "SET_LAST_SELECTED",
    lastSelected
})

export const setRightSelected = (selected) => ({
    type: "SET_RIGHT_SELECTED", 
    selected
})

export const setShareSelected = (selected) => ({
    type: "SET_SHARE_SELECTED",
    selected
})

export const editShareSelected = (selected) => ({
    type: "EDIT_SHARE_SELECTED",
    selected
}) 

export const setSelected = (selected) => ({
    type: "SET_SELECTED",
    selected
})