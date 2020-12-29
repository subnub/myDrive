export const setFolderTreeID = (id) => ({
    type:"SET_ID",
    id
})

export const resetFolderTreeID = () => ({
    type:"RESET_ID"
})

export const removeFolderTreeID = (id) => ({
    type: "REMOVE_ID",
    id
})

export const addNewFolderTreeID = (id, addData) => ({
    type: "ADD_NEW_IDS",
    id,
    addData
})

export const removeNewFolderTreeID = (id) => ({
    type: "REMOVE_NEW_IDS",
    id
})

export const addDeleteFolderTreeID = (id, deleteData) => ({
    type: "ADD_DELETE_IDS",
    id,
    deleteData
})

export const removeDeleteFolderTreeID = (id) => ({
    type: "REMOVE_DELETE_IDS",
    id
})

export const addMoveFolderTreeID = (id, moveData) => ({
    type: "ADD_MOVE_IDS",
    id,
    moveData
})

export const removeMoveFolderTreeID = (id) => ({
    type: "REMOVE_MOVE_IDS",
    id
})

export const addRenameFolderTreeID = (id, renameData) => ({
    type: "ADD_RENAME_IDS",
    id,
    renameData
})

export const removeRenameFolderTreeID = (id) => ({
    type: "REMOVE_RENAME_IDS",
    id
})

export const setFirstLoadDetailsFolderTree = (firstLoadDetails) => ({
    type: "SET_FIRST_LOAD_DETAILS",
    firstLoadDetails
})

export const setInsertedFolderTreeID = (id, insertedList) => ({
    type: "SET_INSERT_IDS",
    id, 
    insertedList
})