const defaultState = {
    selected: ""
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_UPLOAD_SWITCHER_ID": {

            return {
                ...state,
                selected: action.storage
            }
        }

        case "RESET_UPLOAD_SWITCHER_ID": {

            return {
                ...state,
                selected: ""
            }
        }

        default:
            return state;
    }
}