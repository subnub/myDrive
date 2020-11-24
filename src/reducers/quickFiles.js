import mobilecheck from "../utils/mobileCheck";

const defaultState = [];


export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_QUICK_FILES":

            return action.files

        case "ADD_QUICK_FILE": {

            if ((mobilecheck() && state.length >= 2) || state.length >= 10) {
                let temp = state;
                temp.pop()
                return [action.file, ...state]
            } else {
                return [action.file, ...state]
            }
        }

        case "EDIT_FILE":

            return state.map((file) => {

                if (file._id === action.id) {

                    return {...file, ...action.file}

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