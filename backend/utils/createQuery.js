const createQuery = (owner, parent,sortBy, startAt, startAtDate,searchQuery, startAtName) => {

    let query = {"metadata.owner": owner}

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

module.exports = createQuery