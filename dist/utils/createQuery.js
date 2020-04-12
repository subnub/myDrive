"use strict";
const createQuery = (owner, parent, sortBy, startAt, startAtDate, searchQuery, startAtName) => {
    let query = { "metadata.owner": owner };
    if (searchQuery !== "") {
        searchQuery = new RegExp(searchQuery, 'i');
        query = Object.assign(Object.assign({}, query), { filename: searchQuery });
    }
    else {
        query = Object.assign(Object.assign({}, query), { "metadata.parent": parent });
    }
    if (startAt) {
        if (sortBy === "date_desc" || sortBy === "DEFAULT") {
            query = Object.assign(Object.assign({}, query), { "uploadDate": { $lt: new Date(startAtDate) } });
        }
        else if (sortBy === "date_asc") {
            query = Object.assign(Object.assign({}, query), { "uploadDate": { $gt: new Date(startAtDate) } });
        }
        else if (sortBy === "alp_desc") {
            query = Object.assign(Object.assign({}, query), { "filename": { $lt: startAtName } });
        }
        else {
            query = Object.assign(Object.assign({}, query), { "filename": { $gt: startAtName } });
        }
    }
    return query;
};
module.exports = createQuery;
