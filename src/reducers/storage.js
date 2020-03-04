const defaultState = {
    free: 0,
    total: 0,
    available: 0   
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_STORAGE":

            return {
                ...action.info
            }

        case "RESET_STORAGE":

            return defaultState

        default:

            return state;
    }
}