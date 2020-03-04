export default (state = [], action) => {

    switch (action.type) {

        case "SET_FILES":
            return action.files

        case "ADD_FILE":

            return [
                action.file,
                ...state
            ]

        case "LOAD_MORE_FILES":

            return [
                ...state,
                ...action.files
            ]

        case "EDIT_FILE":

            return state.map((file) => {

                if (file._id === action.id) {

                    return {...file, ...action.file}

                } else {

                    return file
                }
            })

        case "EDIT_FILE_METADATA": 

            return state.map((file) => {

                if (file._id === action.id) {

                    return {...file, metadata: {...file.metadata, ...action.metadata}}

                } else {

                    return file
                }
            })

        case "REMOVE_FILE": 

            return state.filter((file) => {

                return file._id !== action.id
            })

        default: 
            return state;
    }
}