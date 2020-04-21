const sortBySwitchFolder = (sortBy: string) => {
    switch(sortBy) {

        case "alp_asc":
            return {name: 1}
        case "alp_desc": 
            return {name: -1}
        case "date_asc":
            return {createdAt: 1}
        default:
            return {createdAt: -1}
    }
}

export default sortBySwitchFolder;