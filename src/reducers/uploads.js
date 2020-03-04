const defaultState = []

export default (state = defaultState, action) => {

    switch(action.type) {

        case "ADD_UPLOAD":

            return [action.upload, ...state]

        case "EDIT_UPLOAD":

            return state.map((upload) => {

                //console.log("edit upload", upload.id, action.id)

                if (upload.id === action.id) {

                    //console.log("edit match", action.progress)
                    upload.progress = action.progress
                    upload.completed = action.completed
                }

                return upload

            })

        case "CANCEL_UPLOAD": 

            return state.map((upload) => {

                if (upload.id === action.id) {

                    upload.canceled = true;
                }

                return upload

            })

        case "RESET_UPLOADS": 

            return []

        default:

            return state
    }
}