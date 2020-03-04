const defaultState = {
    parentList: ["/"],
    parentNameList: ["Home"],
    parent: "/"
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_PARENT":

            return {
                ...state,
                parent: action.parent,
            }
        case "ADD_PARENT_LIST": 

            return {
                ...state,
                parentList: [...state.parentList, action.parent],
                parentNameList: [...state.parentNameList, action.name]
            }

        case "ADJUST_PARENT_LIST": 

            return {
                ...state, 
                parentList: action.parentList,
                parentNameList: action.parentNameList
            }

        case "SET_PARENT_LIST":
            
            return {
                ...state,
                parentList: action.parentList,
                parentNameList: action.parentNameList
            }

        case "REMOVE_PARENT_LIST":
        
            return {
                ...state,
                parentList: parentList.filter((parent) => {
                    return parent._id !== action.parent
                })
            }
        
        case "RESET_PARENT_LIST":

            return {
                ...state,
                parentList: ["/"],
                parentNameList: ["Home"]
            }

        case "ADD_PARENT_NAME_LIST": 

            return {
                ...state,
                parentNameList: [...state.parentNameList, action.name]
            }

        default:
            return state;
    }

}