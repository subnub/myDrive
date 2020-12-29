const defaultState = {
    open: false,
    isFile: false,
    data: {}
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_MOBILE_CONTEXT": {

            return {
                ...state,
                open: true,
                isFile: action.isFile,
                data: action.data
            }
        }

        case "RESET_MOBILE_CONTEXT": {

            return {
                ...state,
                open: false
            };
        }

        default: {
            return state;
        }
    }
}