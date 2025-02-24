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
let authToken2;
let file;
let file2;
let user;
let user2;

describe("File Controller", () => {
  beforeAll(async () => {
    envFileFix(env);
    await getKey();
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true });
  });

  beforeEach(async () => {
    await mongoose.model("fs.files").deleteMany({});
    await mongoose.model("Folder").deleteMany({});
    await mongoose.model("User").deleteMany({});

    user = await request(app)
      .post("/user-service/create")
      .send({
        email: "test@test.com",
        password: "test1234",
      })
      .set("uuid", 12314123123);

    user2 = await request(app)
      .post("/user-service/create")
      .send({
        email: "test@test2.com",
        password: "test1234",
      })
      .set("uuid", 12314123124);

    authToken = user.headers["set-cookie"]
      .map((cookie) => cookie.split(";")[0])
      .join("; ");

    authToken2 = user2.headers["set-cookie"]
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("User info: GET /user-service/user", () => {
    test("Should return user info", async () => {
      const userResponse = await request(app)
        .get(`/user-service/user`)
        .set("Cookie", authToken);

      expect(userResponse.status).toBe(200);
      expect(userResponse.body.email).toBe(user.body.user.email);
    });
    test("Should return 401 if not authorized", async () => {
      const userResponse = await request(app)
        .get(`/user-service/user`)
        .set("Cookie", "access-token=test");

      expect(userResponse.status).toBe(401);
    });
  });
  describe("User login: POST /user-service/login", () => {
    test("Should login user", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: user.body.user.email,
        password: "test1234",
      });

      expect(userResponse.status).toBe(200);
      expect(userResponse.body.user.email).toBe(user.body.user.email);
    });
    test("Should return 401 if incorrect password", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: user.body.user.email,
        password: "test12345",
      });

      expect(userResponse.status).toBe(401);
    });
    test("Should return 401 if incorrect email", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: "notexist@test.com",
        password: "test1234",
      });
      expect(userResponse.status).toBe(401);
    });
  });
  describe("Create User: POST /user-service/create", () => {
    test("Should create user", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "newuser@test.com",
          password: "test1234",
        });

      expect(userResponse.status).toBe(201);

      const userDbCheck = await mongoose.model("User").findOne({
        _id: userResponse.body.user._id,
      });

      expect(userDbCheck.email).toBe(userResponse.body.user.email);
    });
    test("Should return 400 if no email", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          password: "test1234",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if no password", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "newuser@test.com",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if email length is less than 1", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "",
          password: "test1234",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if email length is greater than 256", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "a" * 257,
          password: "test1234",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if password length is less than 6", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "newuser@test.com",
          password: "",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if password length is greater than 256", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "newuser@test.com",
          password: "a" * 257,
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 409 if email already exists", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "test@test.com",
          password: "test1234",
        });

      expect(userResponse.status).toBe(409);
    });
    test("Should return 403 if create account is blocked", async () => {
      env.createAcctBlocked = true;

      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "newemail@test.com",
          password: "test1234",
        });

      expect(userResponse.status).toBe(403);
    });
  });
});
