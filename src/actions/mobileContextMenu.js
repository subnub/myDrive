export const setMobileContextMenu = (isFile, data) => ({
    type: "SET_MOBILE_CONTEXT",
    isFile,
    data
})

export const resetMobileContextMenu = () => ({
    type: "RESET_MOBILE_CONTEXT"
})