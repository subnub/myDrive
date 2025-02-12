const request = require("supertest");
const app = require("../utils/express-app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const getEnvVariables = require("../../dist-backend/enviroment/get-env-variables");
const getKey = require("../../dist-backend/key/get-key").default;
getEnvVariables();
const env = require("../../dist-backend/enviroment/env");
const { envFileFix } = require("../utils/db-setup");

let mongoServer;

describe("File Controller", () => {
  let authToken;

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

    console.log(user.body);

    authToken = user.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("File info: GET /file-service/info/:id", () => {
    test("Should return file info", () => {
      expect(true).toBe(true);
    });
  });
});
