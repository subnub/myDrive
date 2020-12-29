const defaultState = {
    id: "",
    parent: "/",
    isFile: true,
    isGoogle: false,
    isPersonal: false
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "SET_MOVER_ID":

            return {
                ...state,
                id: action.id,
                parent: action.parent,
                isFile: action.isFile,
                isGoogle: action.isGoogle,
                isPersonal: action.isPersonal
            }

        case "RESET_MOVER_ID":

            return {
                ...state,
                id: "",
                parent: "/",
                isFile: action.isFile,
                isGoogle: false,
                isPersonal: false,
            }

        default: {
            return state;
        }
    }
}