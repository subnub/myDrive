const sortBySwitch = (sortBy) => {
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

module.exports = sortBySwitch;