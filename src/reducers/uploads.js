const defaultState = [];

export default (state = defaultState, action) => {
  switch (action.type) {
    case "ADD_UPLOAD":
      return [action.upload, ...state];

    case "EDIT_UPLOAD":
      return state.map((upload) => {
        if (upload.id === action.id) {
          return {
            ...upload,
            progress: action.progress,
            completed: action.completed,
          };
        }

        return upload;
      });

    case "CANCEL_UPLOAD":
      return state.map((upload) => {
        if (upload.id === action.id) {
          return {
            ...upload,
            canceled: true,
          };
        }

        return upload;
      });

    case "RESET_UPLOADS":
      return [];

    default:
      return state;
  }
};
