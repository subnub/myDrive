const defaultState = {
    currentRoute: "/home"
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_CURRENT_ROUTE":

            return {
                ...state,
                currentRoute: action.route
            }

        case "RESET_CURRENT_ROUTE":

            return {
                ...state,
                currentRoute: "/home"
            }

        default:
            return state;
    }
}