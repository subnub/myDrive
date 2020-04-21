const sortBySwitch = (sortBy: string) => {
    switch(sortBy) {

        case "alp_asc":
            return {filename: 1}
        case "alp_desc": 
            return {filename: -1}
        case "date_asc":
            return {uploadDate: 1}
        default:
            return {uploadDate: -1}
    }
}

export default sortBySwitch;