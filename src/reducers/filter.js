const defaultState = {
    sortBy: "date_desc",
    limit: 50,
    search: "",
    listView: false,
    currentlySearching: false,
}

export default (state = defaultState, action) => {

    switch(action.type) {

        case "ENABLE_LIST_VIEW": {

            return {
                ...state, 
                listView: true
            }
        }

        case "DISABLE_LIST_VIEW": {

            return {
                ...state, 
                listView: false
            }
        }

        case "SET_SORT_BY": {
                
                return {
                    ...state,
                    sortBy: action.sortBy
                }
                
            }

        case "RESET_Filters": {
            return defaultState
        }
        
        case "SET_LIMIT":

            return {
                ...state,
                limit: action.limit
            }
        
        case "SET_SEARCH":

            return {
                ...state,
                search: action.search
            }

        case "RESET_SEARCH":

            return {
                ...state,
                search: ""
            }

        case "SET_CURRENTLY_SEARCHING":

            return {
                ...state,
                currentlySearching: true
            }

        case "RESET_CURRENTLY_SEARCHING":

            return {
                ...state,
                currentlySearching: false
            }

        default:
            return state;
    }

}