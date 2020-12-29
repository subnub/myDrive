const gridView = window.localStorage.getItem("grid-mode");

const sortBy = window.localStorage.getItem("name-mode") 
? window.localStorage.getItem("asc-mode") ? 'alp_asc' : 'alp_desc' : window.localStorage.getItem("asc-mode") ? 'date_asc' : 'date_desc';

const defaultState = {
    sortBy: sortBy,
    limit: 50,
    search: "",
    listView: !gridView,
    currentlySearching: false,
    isGoogle: false
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

        case "SET_IS_GOOGLE":

            return {
                ...state,
                isGoogle: true
            }

        case "SET_NOT_GOOGLE":

            return {
                ...state,
                isGoogle: false
            }

        default:
            return state;
    }

}