const defaultState = {
    id: "",
    openIDs: {

    },
    newIDs: {

    },
    newID: "",
    deleteIDs: {

    },
    deleteID: "",
    moveIDs: {

    },
    moveID: "",
    renameIDs: {

    }, 
    renameID: "",
    firstLoadDetails: {

    },
    insertedIDs: {

    },
    insertedID: ""
}

export default (state=defaultState, action) => {

    switch (action.type) {

        case "SET_ID": 
            
            let tempIDS = state.openIDs;
            tempIDS[action.id] = true;

            return {
                ...state,
                id: action.id,
                openIDs: tempIDS
            }

        case "SET_FIRST_LOAD_DETAILS":

            return {
                ...state,
                firstLoadDetails: action.firstLoadDetails
            }

        case "ADD_NEW_IDS":

            let tempNewIDs = state.newIDs;
            tempNewIDs[action.id] = action.addData;

            return {
                ...state,
                newID: action.id,
                newIDs: tempNewIDs
            }

        case "REMOVE_NEW_IDS": {
            
            //console.log("remove new id", action.id, state.newIDs);
            let tempRemoveNewIDS = state.newIDs;
            delete tempRemoveNewIDS[action.id];
            //console.log("removed new id", tempRemoveNewIDS);

            return {
                ...state,
                newIDs: tempRemoveNewIDS,
                newID: ""
            }
        }

        case "SET_INSERT_IDS": {

            return {
                ...state,
                insertedIDs: action.insertedList,
                insertedID: action.id,
            }
        
        }

        case "REMOVE_INSERT_IDS": {

            return {

            }
        }

        case "ADD_DELETE_IDS": {

            //console.log("delete ids", action.id);
            let tempDeleteIDs = state.deleteIDs;
            tempDeleteIDs[action.id] = action.deleteData;

            return {
                ...state,
                deleteID: action.id,
                deleteIDs: tempDeleteIDs
            }
        }

        case "REMOVE_DELETE_IDS": {
            
            let tempDeleteIDs = state.deleteIDs;
            delete tempDeleteIDs[action.id];

            return {
                ...state,
                deleteIDs: tempDeleteIDs,
                deleteID: ""
            }
        }

        case "ADD_MOVE_IDS": {

            let tempMoveIDs = state.moveIDs;
            tempMoveIDs[action.id] = action.moveData;

            return {
                ...state,
                moveID: action.id,
                moveIDs: tempMoveIDs
            }
        }

        case "REMOVE_MOVE_IDS": {

            let tempMoveIDs = state.moveIDs;
            delete tempMoveIDs[action.id];

            return {
                ...state,
                moveID: "",
                moveIDs: tempMoveIDs
            }

        }

        case "ADD_RENAME_IDS": {

            console.log("add rename", action.renameData)
            let tempRenameIDs = state.renameIDs;
            tempRenameIDs[action.id] = action.renameData;

            return {
                ...state,
                renameID: action.id,
                renameIDs: tempRenameIDs
            }
        }

        case "REMOVE_RENAME_IDS": {

            console.log("remove rename", state.renameIDs)
            let tempRenameIDs = state.renameIDs;
            delete tempRenameIDs[action.id];

            return {
                ...state,
                renameID: "",
                renameIDs: tempRenameIDs
            }

        }

        case "REMOVE_ID":

            console.log("before remove", state.openIDs)
            let tempRemoveIDS = state.openIDs;
            delete tempRemoveIDS[action.id];

            console.log("removed id", action.id, tempRemoveIDS)

            return {
                ...state,
                id: "-",
                openIDs: tempRemoveIDS
            }

        case "RESET_ID": 

            return {
                ...state,
                id: "",
                openIDs: {}
            }

        default:
            return state
    }
}