const streamToBuffer = (stream: any) => {
    const chunks: any[] = []
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: any) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
}

export default streamToBuffer;