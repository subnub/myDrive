const awaitStream = <T>(inputSteam: any, outputStream: any, allStreamsToErrorCatch: any[]) => {

    return new Promise<T>((resolve, reject) => {

        allStreamsToErrorCatch.forEach((currentStream: any) => {

            currentStream.on("error", (e: Error) => {
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                })
            })
            
        })

        inputSteam.pipe(outputStream).on("finish", (data: T) => {
            console.log("await stream finished")
            resolve(data);
        })
    })
}

export default awaitStream;