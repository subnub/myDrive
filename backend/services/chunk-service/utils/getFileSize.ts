import fs from "fs";

const getFileSize = (path: string) => {

    return new Promise((resolve, reject) => {

        fs.stat(path, (error, stats) => {

            if (error) {
                
                resolve(0);
            }

            resolve(stats.size);
        });
    })
}

export default getFileSize;