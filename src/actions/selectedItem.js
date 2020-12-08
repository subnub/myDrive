import axios from "../axiosInterceptor";

export const setSelectedItem = (selectedItem) => ({
    type: "SET_SELECTED_ITEM", 
    selectedItem
})

export const startSetSelectedItem = (id, file, fromQuickItems, isGoogleDrive) => {

    return (dispatch) => {
        
        const currentDate = Date.now();

        dispatch(setLastSelected(currentDate));
        
        if (!fromQuickItems) {
            dispatch(setSelected(id))
        } else {
            dispatch(setSelected("quick-"+id))
        }

        if (file) {

            if (isGoogleDrive) {

                axios.get(`/file-service-google/info/${id}`).then((results) => {

                    const data = results.data;

                    const {filename: name, length: size, uploadDate: date, parentName: location, metadata, _id: id} = results.data;
    
                    dispatch(setSelectedItem({name, size, date, file, location, transcoded: metadata.transcoded, isVideo: metadata.isVideo, id, linkType: metadata.linkType, link: metadata.link, drive: metadata.drive, personalFile: metadata.personalFile, data: results.data}))

                }).catch((err) => {
                    console.log(err)
                })

            } else {

                axios.get(`/file-service/info/${id}`).then((results) => {

                    const {filename: name, length: size, uploadDate: date, parentName: location, metadata, _id: id} = results.data;
    
                    dispatch(setSelectedItem({name, size, date, file, location, transcoded: metadata.transcoded, isVideo: metadata.isVideo, id, linkType: metadata.linkType, link: metadata.link, drive: metadata.drive, personalFile: metadata.personalFile, data: results.data}))
                    
                }).catch((err) => {
                    console.log(err)
                })
            }

        } else {

            if (isGoogleDrive) {

                axios.get(`/folder-service-google/info/${id}`).then((results) => {

                    const {name, 0: size, createdAt: date, parentName: location, _id: id, drive, personalFolder: personalFile} = results.data;
    
                    dispatch(setSelectedItem({name, size, date, file, location, data: results.data, id, drive, personalFile}))
                    
                }).catch((err) => {
                    console.log(err)
                })

            } else {

                axios.get(`/folder-service/info/${id}`).then((results) => {

                    const {name, 0: size, createdAt: date, parentName: location, _id: id, drive, personalFolder: personalFile} = results.data;
    
                    dispatch(setSelectedItem({name, size, date, file, location, data: results.data, id, drive, personalFile}))
                    
                }).catch((err) => {
                    console.log(err)
                })
            }
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