const createQueryGoogleFolder = (query: any, parent: string) => {
    
    let orderBy = ""
    
    if (query.sortby === "date_desc") {
        orderBy = "modifiedTime desc"
    } else if (query.sortby === "date_asc") {
        orderBy = "modifiedTime asc"
    } else if (query.sortby === "alp_desc") {
        orderBy = "name desc"
    } else {
        orderBy = "name asc"
    }

    let queryBuilder = `mimeType = "application/vnd.google-apps.folder"`

    if (query.search && query.search.length !== 0) {
        queryBuilder += ` and name contains "${query.search}"`
    } else {
        queryBuilder += ` and "${parent}" in parents`;
    }

    queryBuilder += ` and trashed=false`;

    return {orderBy, queryBuilder}
}

export default createQueryGoogleFolder;