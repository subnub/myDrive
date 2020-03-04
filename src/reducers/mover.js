const defaultState = {
    id: "",
    parent: "/",
    isFile: true,
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_MOVER_ID":

            return {
                ...state,
                id: action.id,
                parent: action.parent,
                isFile: action.isFile
            }

        case "RESET_MOVER_ID":

            return {
                ...state,
                id: "",
                parent: "/",
                isFile: action.isFile
            }

        default: {
            return state;
        }
    }
}