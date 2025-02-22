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
let authToken;
let folder;
let user;

describe("File Controller", () => {
  beforeAll(async () => {
    envFileFix(env);
    await getKey();
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true });
    user = await request(app)
      .post("/user-service/create")
      .send({
        email: "test@test.com",
        password: "test1234",
      })
      .set("uuid", 12314123123);

    authToken = user.headers["set-cookie"]
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
  });

  beforeEach(async () => {
    await mongoose.model("fs.files").deleteMany({});
    await mongoose.model("Folder").deleteMany({});

    const folderResponse = await request(app)
      .post("/folder-service/create")
      .set("Cookie", authToken)
      .send({
        name: "test",
        parent: "/",
      });

    expect(folderResponse.status).toBe(201);
    folder = folderResponse.body;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Folder info: GET /folder-service/info/:id", () => {
    test("Should return folder info", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/info/${folder._id}`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.name).toBe(folder.name);
    });
    test("Should return 404 if folder not found", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/info/5f7e5d8d1f962d5a0f5e8a9e`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/info/${folder._id}`)
        .set("Cookie", "access-token=test");

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of folder", async () => {
      const user2 = await request(app)
        .post("/user-service/create")
        .send({
          email: "test4@test.com",
          password: "test1234",
        })
        .set("uuid", 12314123123);

      expect(user2.status).toBe(201);

      const authToken2 = user2.headers["set-cookie"]
        .map((cookie) => cookie.split(";")[0])
        .join("; ");

      const folderCreateResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken2)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderCreateResponse.status).toBe(201);

      const folderResponse = await request(app)
        .get(`/folder-service/info/${folderCreateResponse.body._id}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(folderResponse.status);
    });
  });
  describe("Create folder: POST /folder-service/create", () => {
    test("Should create folder", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folderResponse.body._id,
      });

      expect(folderDbCheck.name).toBe(folderResponse.body.name);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", "access-token=test")
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 400 if no name", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          parent: "/",
        });

      expect(folderResponse.status).toBe(400);
    });
    test("Should return 400 is name length is less than 1", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          name: "",
          parent: "/",
        });

      expect(folderResponse.status).toBe(400);
    });
  });
});
