const defaultState = {

    showSettings: false
}

export default (state = defaultState, action) => {

    switch (action.type) {

        case "SHOW_SETTINGS": 

            return {
                ...state,
                showSettings: true
            }
        

        case "HIDE_SETTINGS":

            return {
                ...state, 
                showSettings: false
            }
        

        default: 

            return state;
        
    }
    
}