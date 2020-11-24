export const setMoverID = (id, parent, isFile, isGoogle=false, isPersonal=false) => ({
    type: "SET_MOVER_ID",
    id,
    parent,
    isFile,
    isGoogle,
    isPersonal
})

export const resetMoverID = () => ({
    type: "RESET_MOVER_ID"
})