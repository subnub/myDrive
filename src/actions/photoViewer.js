export const setPhotoID = (id, isGoogle=false, isPersonal=false) => ({
    type: "SET_PHOTO_ID",
    id,
    isGoogle,
    isPersonal
})

export const resetPhotoID = () => ({
    type: "RESET_PHOTO_ID"
})