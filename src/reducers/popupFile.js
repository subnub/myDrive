const defaultState = {
    showPopup: false
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_POPUP_FILE":

            return action.file

        case "SHOW_POPUP": 

            return {
                ...state, 
                showPopup: true
            }

        case "HIDE_POPUP":

            return {
                ...state,
                showPopup: false
            }

        default: 

            return state;
    }
}