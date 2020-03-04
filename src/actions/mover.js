export const setMoverID = (id, parent, isFile) => ({
    type: "SET_MOVER_ID",
    id,
    parent,
    isFile
})

export const resetMoverID = () => ({
    type: "RESET_MOVER_ID"
})