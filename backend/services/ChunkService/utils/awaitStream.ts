const awaitStream = <T>(inputSteam: any, outputStream: any) => {

    return new Promise<T>((resolve, reject) => {

        inputSteam.on("error", (e: Error) => {
            reject({
                message: "Await Stream Input Error",
                code: 500,
                error: e
            })
        })

        outputStream.on("error", (e: Error) => {
            reject({
                message: "Await Stream Output Error",
                code: 500,
                error: e
            })
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            console.log("await stream finished")
            resolve(data);
        })
    })
}

export default awaitStream;