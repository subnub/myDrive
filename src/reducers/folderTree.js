const defaultState = {
  id: "",
  openIDs: {},
  newIDs: {},
  newID: "",
  deleteIDs: {},
  deleteID: "",
  moveIDs: {},
  moveID: "",
  renameIDs: {},
  renameID: "",
  firstLoadDetails: {},
  insertedIDs: {},
  insertedID: "",
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case "SET_ID":
      return {
        ...state,
        id: action.id,
        openIDs: {
          ...state.openIDs,
          [action.id]: true,
        },
      };

    case "SET_FIRST_LOAD_DETAILS":
      return {
        ...state,
        firstLoadDetails: action.firstLoadDetails,
      };

    case "ADD_NEW_IDS":
      return {
        ...state,
        newID: action.id,
        newIDs: {
          ...state.newIDs,
          [action.id]: action.addData,
        },
      };

    case "REMOVE_NEW_IDS": {
      const { [action.id]: _, ...nonRemovedIds } = state.newIDs;

      return {
        ...state,
        newIDs: nonRemovedIds,
        newID: "",
      };
    }

    case "SET_INSERT_IDS": {
      return {
        ...state,
        insertedIDs: action.insertedList,
        insertedID: action.id,
      };
    }

    case "REMOVE_INSERT_IDS": {
      return {};
    }

    case "ADD_DELETE_IDS": {
      return {
        ...state,
        deleteID: action.id,
        deleteIDs: {
          ...state.deleteIDs,
          [action.id]: action.deleteData,
        },
      };
    }

    case "REMOVE_DELETE_IDS": {
      const { [action.id]: _, ...nonRemovedIds } = state.deleteIDs;

      return {
        ...state,
        deleteIDs: nonRemovedIds,
        deleteID: "",
      };
    }

    case "ADD_MOVE_IDS": {
      return {
        ...state,
        moveID: action.id,
        moveIDs: {
          ...state.moveIDs,
          [action.id]: action.moveData,
        },
      };
    }

    case "REMOVE_MOVE_IDS": {
      const { [action.id]: _, ...nonRemovedIds } = state.moveIDs;

      return {
        ...state,
        moveID: "",
        moveIDs: nonRemovedIds,
      };
    }

    case "ADD_RENAME_IDS": {
      return {
        ...state,
        renameID: action.id,
        renameIDs: {
          ...state.renameIDs,
          [action.id]: action.renameData,
        },
      };
    }

    case "REMOVE_RENAME_IDS": {
      const { [action.id]: _, ...nonRemovedIds } = state.renameIDs;

      return {
        ...state,
        renameID: "",
        renameIDs: nonRemovedIds,
      };
    }

    case "REMOVE_ID":
      const { [action.id]: _, ...nonRemovedIds } = state.openIDs;

      return {
        ...state,
        id: "-",
        openIDs: nonRemovedIds,
      };

    case "RESET_ID":
      return {
        ...state,
        id: "",
        openIDs: {},
      };

    default:
      return state;
  }
};
