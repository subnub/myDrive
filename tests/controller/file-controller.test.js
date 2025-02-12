const request = require("supertest");
const app = require("../utils/express-app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const getEnvVariables = require("../../dist-backend/enviroment/get-env-variables");
const getKey = require("../../dist-backend/key/get-key").default;
getEnvVariables();
const env = require("../../dist-backend/enviroment/env");
const { envFileFix } = require("../utils/db-setup");
const { ObjectId } = require("mongodb");

let mongoServer;

describe("File Controller", () => {
  let authToken;
  let file;

  beforeAll(async () => {
    envFileFix(env);
    await getKey();

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true });

    const user = await request(app)
      .post("/user-service/create")
      .send({
        email: "test@test.com",
        password: "test1234",
      })
      .set("uuid", 12314123123);

    file = await mongoose.model("fs.files").create({
      _id: new ObjectId("5eb88f29ecb8c9319ddca3c2"),
      filename: "test.txt",
      uploadDate: new Date(),
      length: 10000,
      metadata: {
        owner: user.body.user._id,
        parent: "/",
        parentList: "/",
        hasThumbnail: false,
        size: "10000",
        IV: "test",
        isVideo: false,
      },
    });

    authToken = user.headers["set-cookie"]
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("File info: GET /file-service/info/:id", () => {
    test("Should return file info", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/info/${file._id}`)
        .set("Cookie", authToken);

      console.log("fileResponse", fileResponse.body);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.filename).toBe(file.filename);
      expect(fileResponse.body.length).toBe(file.length);
    });
  });
});
