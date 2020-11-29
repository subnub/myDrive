import moment from "moment"

const defaultState = {
    showSideBar: true,
    uploaderShow: true,
    resetItems: moment.now(),
    loadMoreItems: false,
    loading: false,
    loginFailed: false,
    loginFailedCode: 401,
    createNewAccount: false,
    currentRouteType: "home",
    cachedSearch: "",
    uploadOverlayOpen: false,
    leftSectionMode: "",
    rightSectionMode: "",
    loadingMoreItems: false
    // resetSettingsMain: "",
}

export default (state = defaultState, action) => {

    switch (action.type) {

        // case "RESET_SETTINGS_MAIN": {
        
        //     console.log("Redux reset settings", action.id)

        //     return {
        //         ...state,
        //         resetSettingsMain: action.id
        //     }

        // }

        case "LOADING_MORE_ITEMS": {
            
            return {
                ...state,
                loadingMoreItems: action.loading
            }
        }

        case "SET_LEFT_SECTION_MODE": {

            return {
                ...state,
                leftSectionMode: action.mode
            }
        }

        case "SET_RIGHT_SECTION_MODE": {

            return {
                ...state,
                rightSectionMode: action.mode
            }
        }

        case "OPEN_UPLOAD_OVERLAY": {

            return {
                ...state,
                uploadOverlayOpen: true
            }
        }

        case "CLOSE_UPLOAD_OVERLAY": {

            return {
                ...state,
                uploadOverlayOpen: false
            }
        }

        case "SET_CACHED_SEARCH": 

            return {
                ...state,
                cachedSearch: action.search
            }

        case "SET_CURRENT_ROUTE_TYPE":

            return {
                ...state,
                currentRouteType: action.route
            }

        case "SET_CREATE_NEW_ACCOUNT":

            return {
                ...state,
                createNewAccount: action.value
            }

        case "SET_LOGIN_FAILED":

            return {
                ...state,
                loginFailed: action.message,
                loginFailedCode: action.code
            }

        case "SET_LOADING": 

            return {
                ...state,
                loading: action.load
            }
        

        case "LOAD_MORE_ITEMS":

            return {

                ...state,
                loadMoreItems: action.load
            }

        case "RESET_ITEMS":

            return {
                ...state, 
                resetItems: moment.now()
            }

        case "SHOW_UPLOADER": {

            return {
                ...state,
                uploaderShow: true
            }
        }

        case "HIDE_UPLOADER": {
            
            return {
                ...state,
                uploaderShow: false
            }
        }

        case "SHOW_SIDEBAR":

            return {
                ...state,
                showSideBar: true
            }
        case "HIDE_SIDEBAR":

            return {
                ...state,
                showSideBar: false
            }

        case "GONE_SIDEBAR":

            return {
                ...state, 
                showSideBar: "gone"
            }

        default: 
            return state;
    }
}