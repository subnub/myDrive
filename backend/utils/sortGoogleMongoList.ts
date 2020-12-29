import { FileInterface } from "../models/file";

const sortGoogleMongoList = (fileList: FileInterface[], query: any) => {

    let combinedList = fileList;

    if (query.sortby === "date_desc" || query.sortby === "DEFAULT") {

        combinedList = combinedList.sort((a, b) => {
            const convertedDateA = new Date(a.uploadDate).getTime();
            const convertedDateB = new Date(b.uploadDate).getTime();
            //onsole.log("data", b.uploadDate, convertedDate)
            return convertedDateB - convertedDateA;
        })
    } else if (query.sortby === "date_asc") {

        combinedList = combinedList.sort((a, b) => {
            const convertedDateA = new Date(a.uploadDate).getTime();
            const convertedDateB = new Date(b.uploadDate).getTime();
            //onsole.log("data", b.uploadDate, convertedDate)
            return convertedDateA - convertedDateB;
        })
    } else if (query.sortby === "alp_desc") {

        combinedList = combinedList.sort((a, b) => {
        
            const name1 = a.filename.toLowerCase();
            const name2 = b.filename.toLowerCase();

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
        
            const name1 = a.filename.toLowerCase();
            const name2 = b.filename.toLowerCase();

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

export default sortGoogleMongoList;