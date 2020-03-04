const defaultState = {
    id: ""
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_PHOTO_ID":
            
            return {
                ...state,
                id: action.id
            }

        case "RESET_PHOTO_ID":

            return {
                ...state,
                id: ""
            }

        default:
            return state;
    }
}