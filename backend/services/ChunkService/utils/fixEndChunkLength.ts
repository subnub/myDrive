const fixEndChunkLength = (length: number) => {

    return Math.floor((length-1) / 16) * 16 + 16;
}

export default fixEndChunkLength;