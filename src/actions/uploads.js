export const addUpload = (upload) => ({
    type: "ADD_UPLOAD",
    upload
})

export const resetUpload = () => ({
    type: "RESET_UPLOADS"
})

export const editUpload = (id, progress, completed = false) => ({
    type: "EDIT_UPLOAD", 
    id, 
    progress, 
    completed
})

export const cancelUpload = (id) => ({
    type: "CANCEL_UPLOAD",
    id
})

export const startCancelAllUploads = (uploads) => {

    return (dispatch) => {

        for (let i = 0; i < uploads.length; i++) {

            const upload = uploads[i];

            if (!upload.completed) {

                upload.source.cancel("All uploads cancelling")

                dispatch(cancelUpload(upload.id))
            }
        }

        dispatch(resetUpload());
    }
}