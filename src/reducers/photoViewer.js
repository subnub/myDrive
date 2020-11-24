const defaultState = {
    id: "",
    isGoogle: false,
    isPersonal: false,
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_PHOTO_ID":
            
            return {
                ...state,
                id: action.id,
                isGoogle: action.isGoogle,
                isPersonal: action.isPersonal
            }

        case "RESET_PHOTO_ID":

            return {
                ...state,
                id: "",
                isGoogle: false,
                isPersonal: false,
            }

        default:
            return state;
    }
}