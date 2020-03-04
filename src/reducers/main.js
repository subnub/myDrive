import moment from "moment"

const defaultState = {
    showSideBar: true,
    uploaderShow: true,
    resetItems: moment.now(),
    loadMoreItems: true,
    loading: false,
    loginFailed: false,
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SET_LOGIN_FAILED":

            return {
                ...state,
                loginFailed: action.message
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