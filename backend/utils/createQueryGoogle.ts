const createQueryGoogle = (query: any, parent: any) => {

    let queryBuilder = `mimeType != "application/vnd.google-apps.folder"`

    let orderBy = ""

    if (query.sortby === "date_desc" || query.sortby === "DEFAULT") {
        orderBy = "modifiedTime desc"
    } else if (query.sortby === "date_asc") {
        orderBy = "modifiedTime asc"
    } else if (query.sortby === "alp_desc") {
        orderBy = "name desc"
    } else {
        orderBy = "name asc"
    }

    if (query.search && query.search.length !== 0) {
        queryBuilder += ` and name contains "${query.search}"`
    } else {
        queryBuilder += ` and "${parent}" in parents`
        }

    queryBuilder += ` and trashed=false`;

    return {queryBuilder, orderBy}
}

export interface googleQueryType {
    limit: number,
    parent: string,
    pageToken: string,
}

export default createQueryGoogle;