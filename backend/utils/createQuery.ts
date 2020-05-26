export interface QueryInterface {
    "metadata.owner": string,
    "metadata.parent"?: string,
    filename?: string | RegExp | {
        $lt?: string,
        $gt?: string,
    },
    uploadDate?: {
        $lt?: Date,
        $gt?: Date,
    },
}

const createQuery = (owner: string, parent: string, sortBy: string, startAt: number, startAtDate: number, searchQuery: string | RegExp, startAtName: string) => {

    let query: QueryInterface = {"metadata.owner": owner}

    if (searchQuery !== "") {

        searchQuery = new RegExp(searchQuery, 'i')

        query = {...query, filename: searchQuery}

    } else {

        query = {...query, "metadata.parent": parent}
    }

    if (startAt) {

        if (sortBy === "date_desc" || sortBy === "DEFAULT") {

            query = {...query, "uploadDate": {$lt:  new Date(startAtDate)}}

        } else if (sortBy === "date_asc") {

            query = {...query, "uploadDate": {$gt:  new Date(startAtDate)}}

        } else if (sortBy === "alp_desc") {

            query = {...query, "filename": {$lt:  startAtName}}

        } else {

            query = {...query, "filename": {$gt:  startAtName}}
        }
    }


    return query;

}

export default createQuery;