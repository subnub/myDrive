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

export const setLoginFailed = (message, code=401) => ({
    type: "SET_LOGIN_FAILED",
    message, 
    code
})

export const setCreateNewAccount = (value) => ({
    type: "SET_CREATE_NEW_ACCOUNT",
    value
})

export const setCurrentRouteType = (route) => ({
    type:"SET_CURRENT_ROUTE_TYPE",
    route
})

export const setCachedSearch = (search) => ({
    type: "SET_CACHED_SEARCH",
    search
})

export const openUploadOverlay = () => ({
    type: "OPEN_UPLOAD_OVERLAY"
})

export const closeUploadOverlay = () => ({
    type: "CLOSE_UPLOAD_OVERLAY"
})

export const setLeftSectionMode = (mode) => ({
    type: "SET_LEFT_SECTION_MODE",
    mode
})

export const setRightSectionMode = (mode) => ({
    type: "SET_RIGHT_SECTION_MODE",
    mode
})

export const setLoadingMoreItems = (loading) => ({
    type: "LOADING_MORE_ITEMS",
    loading
})

// export const resetSettingsMain = (id) => ({
//     type: "RESET_SETTINGS_MAIN",
//     id
// })