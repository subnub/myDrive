const env = {
    port: process.env.PORT,
    url: process.env.REMOTE_URL,
    enableVideoTranscoding: process.env.ENABLE_VIDEO_TRANSCODING,
    disableStorage: process.env.DISABLE_STORAGE
}

export default env;