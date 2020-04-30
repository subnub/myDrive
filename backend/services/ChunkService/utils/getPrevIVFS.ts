import fs from "fs";

const getPrevIV = (start: number, path: string) => {

    return new Promise<Buffer | string>((resolve, reject) => {

        const stream = fs.createReadStream(path, {
            start,
            end: start + 15
        })

        stream.on("data", (data) => {

            resolve(data);
        })
    })
}

export default getPrevIV;