export default (state = {}, action) => {
    switch (action.type) {

        case "LOGIN":
            return {
                id: action.id,
                user: action.user
            }
        case "LOGOUT":
            return {}
        default:
            return state
    }
}