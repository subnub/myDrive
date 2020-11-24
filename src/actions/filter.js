export const setSortBy = (sortBy) => ({
    type: "SET_SORT_BY",
    sortBy
})

export const setSearch = (search) => ({
    type: "SET_SEARCH",
    search
})

export const resetSearch = () => ({
    type: "RESET_SEARCH"
})

export const enableListView = () => ({
    type: "ENABLE_LIST_VIEW"
})

export const disableListView = () => ({
    type: "DISABLE_LIST_VIEW"
})

export const setCurrentlySearching = () => ({
    type: "SET_CURRENTLY_SEARCHING"
})

export const resetCurrentlySearching = () => ({
    type: "RESET_CURRENTLY_SEARCHING"
})

export const setNotGoogle = () => ({
    type: "SET_NOT_GOOGLE"
})

export const setIsGoogle = () => ({
    type: "SET_IS_GOOGLE"
})