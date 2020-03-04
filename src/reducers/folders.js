export default (state = [], action) => {
    
    switch(action.type) {

        case "ADD_FOLDER": 

            return [
                action.folder,
                ...state
            ]

        case "EDIT_FOLDER":

            return state.map((folder) => {

                if (folder._id === action.id) {

                    return {...folder, ...action.folder}

                } else {

                    return folder
                }
            })

        case "SET_FOLDERS":

            return action.folders;

        case "REMOVE_FOLDER":

            return state.filter((folder) => {
                return action.id !== folder._id;
            })

        default:
            return state;
    }
}