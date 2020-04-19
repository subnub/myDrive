const streamToBuffer = (stream: any, allStreamsToErrorCatch: any[]) => {

  const chunks: any[] = []
  return new Promise<Buffer>((resolve, reject) => {

    allStreamsToErrorCatch.forEach((currentStream) => {

      currentStream.on("error", (e: Error) => {
  
        console.log("Stream To Buffer Error", e);
        reject({
          message: "stream to buffer error",
          code: 500,
          error: e
         })
  
      })
    })

  stream.on('data', (chunk: any) => chunks.push(chunk));
  stream.on('error', reject);
  stream.on('end', () => resolve(Buffer.concat(chunks)));

  })
}

export default streamToBuffer;