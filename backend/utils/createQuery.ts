import s3 from "../db/s3"
import { ObjectID } from "mongodb"

export interface QueryInterface {
    "metadata.owner": ObjectID,
    "metadata.parent"?: string,
    filename?: string | RegExp | {
        $lt?: string,
        $gt?: string,
    },
    uploadDate?: {
        $lt?: Date,
        $gt?: Date,
    },
    "metadata.personalFile"?: boolean | null
}

const createQuery = (owner: string, parent: string, sortBy: string, startAt: number, startAtDate: number, searchQuery: string | RegExp, s3Enabled: boolean,startAtName: string, storageType: string, folderSearch: boolean) => {

    let query: QueryInterface = {"metadata.owner": new ObjectID(owner)}

    if (searchQuery !== "") {

        searchQuery = new RegExp(searchQuery, 'i')

        query = {...query, filename: searchQuery}

        if (parent !== "/" || folderSearch) query = {...query, "metadata.parent": parent}
        //if (parent === "home") query = {...query, "metadata.parent": "/"};

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

    // if (s3Enabled) {
    //     query = {...query, "metadata.personalFile": true}
    // } else 
    if (!s3Enabled) {
        query = {...query, "metadata.personalFile": null}
    }

    // if (storageType === "s3") {
    //     query = {...query, "metadata.personalFile": true}
    // }

    return query;

}

export default createQuery;