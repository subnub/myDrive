export const showSideBar = () => ({
    type: "SHOW_SIDEBAR"
})

export const hideSideBar = () => ({
    type: "HIDE_SIDEBAR"
})

export const goneSideBar = () => ({
    type: "GONE_SIDEBAR"
})

export const resetItems = () => ({
    type: "RESET_ITEMS"
})

export const showUploader = () => ({
    type: "SHOW_UPLOADER"
})

export const hideUploader = () => ({
    type: "HIDE_UPLOADER"
})

export const loadMoreItems = (load) => ({
    type: "LOAD_MORE_ITEMS",
    load
})

export const setLoading = (load) => ({
    type: "SET_LOADING",
    load
})

export const setLoginFailed = (message) => ({
    type: "SET_LOGIN_FAILED",
    message
})
