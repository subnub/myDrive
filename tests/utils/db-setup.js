const createTestData = (mongoose) => {
  const file = new mongoose.model("fs.files");

  file.create({
    name: "test.txt",
    type: "text/plain",
    size: 10,
    userId: "5f7e5d8d1f962d5a0f5e8a9e",
  });
};

const envFileFix = (env) => {
  env.key = process.env.KEY;
  env.newKey = process.env.NEW_KEY;
  env.passwordAccess = process.env.PASSWORD_ACCESS;
  env.passwordRefresh = process.env.PASSWORD_REFRESH;
  env.passwordCookie = process.env.PASSWORD_COOKIE;
  env.createAcctBlocked = process.env.BLOCK_CREATE_ACCOUNT;
  env.root = process.env.ROOT;
  env.url = process.env.URL;
  env.mongoURL = process.env.MONGODB_URL;
  env.dbType = process.env.DB_TYPE;
  env.fsDirectory = process.env.FS_DIRECTORY;
  env.s3ID = process.env.S3_ID;
  env.s3Key = process.env.S3_KEY;
  env.s3Bucket = process.env.S3_BUCKET;
  env.useDocumentDB = process.env.USE_DOCUMENT_DB;
  env.documentDBBundle = process.env.DOCUMENT_DB_BUNDLE;
  env.sendgridKey = process.env.SENDGRID_KEY;
  env.sendgridEmail = process.env.SENDGRID_EMAIL;
  env.remoteURL = process.env.REMOTE_URL;
  env.secureCookies = process.env.SECURE_COOKIES;
  env.tempDirectory = process.env.TEMP_DIRECTORY;
  env.emailVerification = process.env.EMAIL_VERIFICATION;
  env.emailDomain = process.env.EMAIL_DOMAIN;
  env.emailAPIKey = process.env.EMAIL_API_KEY;
  env.emailHost = process.env.EMAIL_HOST;
  env.emailPort = process.env.EMAIL_PORT;
  env.emailAddress = process.env.EMAIL_ADDRESS;
  env.videoThumbnailsEnabled = process.env.VIDEO_THUMBNAILS_ENABLED === "true";
  env.tempVideoThumbnailLimit = process.env.TEMP_VIDEO_THUMBNAIL_LIMIT
    ? +process.env.TEMP_VIDEO_THUMBNAIL_LIMIT
    : 0;
  env.docker = process.env.DOCKER === "true";
};

module.exports = {
  envFileFix,
};
