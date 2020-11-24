const env = {
    port: process.env.PORT,
    url: process.env.REMOTE_URL,
    enableVideoTranscoding: process.env.ENABLE_VIDEO_TRANSCODING,
    disableStorage: process.env.DISABLE_STORAGE,
    googleDriveEnabled: false,
    s3Enabled: false,
    activeSubscription: false,
    commercialMode: process.env.COMMERCIAL_MODE,
    uploadMode: "",
    emailAddress:"",
    name: ""
}

export default env;