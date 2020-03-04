const defaultState = {
    showAddOptions: false,
    showAddOption2: false
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SHOW_ADD_OPTIONS":

            return {
                ...state,
                showAddOptions: action.show
            }

        case "SHOW_ADD_OPTIONS2":

            return {
                ...state,
                showAddOptions2: action.show
            }
        default: 
            return state;
    }
}