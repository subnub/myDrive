const defaultState = {
    name: "",
    id: "",
    selected: "",
    rightSelected: "",
    shareSelected: "",
    selectedItem: "",
    lastSelected: 0,

}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_SELECTED":

            return {
                ...state,
                selected: action.selected
            }

        case "SET_SELECTED_ITEM":
        
            return {
                ...state,
                ...action.selectedItem
            }

        case "EDIT_SELECTED_ITEM":

            return {
                ...state,
                ...action.item
            }

        case "RESET_SELECTED_ITEM": 
            
            return defaultState

        case "EDIT_SHARE_SELECTED":

            return {
                ...state,
                shareSelected: {
                    ...state.shareSelected,
                    ...action.selected
                }
            }

        case "SET_SHARE_SELECTED":

            return {
                ...state,
                shareSelected: action.selected
            }

        case "SET_RIGHT_SELECTED":

            return {
                ...state, 
                rightSelected: action.selected
            }

        case "SET_LAST_SELECTED":

            return {
                ...state, 
                lastSelected: action.lastSelected
            }

        case "RESET_SELECTED":
            
            return {
                ...state,
                selected: ""
            }


        default:
            return state;
    }
}