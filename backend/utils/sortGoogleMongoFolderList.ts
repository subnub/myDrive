import { FolderInterface } from "../models/folder";

const sortGoogleMongoFolderList = (combinedList: FolderInterface[], query: any) => {

    if (query.sortby === "date_desc" || query.sortby === "DEFAULT") {

        combinedList = combinedList.sort((a, b) => {
            const convertedDateA = new Date(a.createdAt).getTime();
            const convertedDateB = new Date(b.createdAt).getTime();
            return convertedDateB - convertedDateA;
        })
    } else if (query.sortby === "date_asc") {

        combinedList = combinedList.sort((a, b) => {
            const convertedDateA = new Date(a.createdAt).getTime();
            const convertedDateB = new Date(b.createdAt).getTime();
            return convertedDateA - convertedDateB;
        })
    } else if (query.sortby === "alp_desc") {

        combinedList = combinedList.sort((a, b) => {
        
            const name1 = a.name.toLowerCase();
            const name2 = b.name.toLowerCase();

            if (name1 > name2) {
                return -1;
            }

            if (name2 > name1) {
                return 1
            }

            return 0;
        })
    } else if (query.sortby === "alp_asc") {

        combinedList = combinedList.sort((a, b) => {
        
            const name1 = a.name.toLowerCase();
            const name2 = b.name.toLowerCase();

            if (name1 > name2) {
                return 1;
            }

            if (name2 > name1) {
                return -1
            }

            return 0;
        })
    }

    return combinedList;
}

export default sortGoogleMongoFolderList;