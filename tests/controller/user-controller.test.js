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
    envFileFix(env);

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
    test("Should return 400 if email length is less than 3", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: "ab",
        password: "test1234",
      });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if email length is greater than 320", async () => {
      const userResponse = await request(app)
        .post("/user-service/login")
        .send({
          email: "a".repeat(321) + "@test.com",
          password: "test1234",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if email address is invalid", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: "a@b",
        password: "test1234",
      });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if password length is less than 6", async () => {
      const userResponse = await request(app).post("/user-service/login").send({
        email: "test@test.com",
        password: "a",
      });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if password length is greater than 256", async () => {
      const userResponse = await request(app)
        .post("/user-service/login")
        .send({
          email: "test@test.com",
          password: "a".repeat(257),
        });

      expect(userResponse.status).toBe(400);
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
    test("Should return 400 if email length is less than 3", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "a@b",
          password: "test1234",
        });

      expect(userResponse.status).toBe(400);
    });
    test("Should return 400 if email length is greater than 320", async () => {
      const userResponse = await request(app)
        .post("/user-service/create")
        .send({
          email: "a".repeat(321) + "@test.com",
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
          password: "a".repeat(267),
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

  describe("Change Password: PATCH /user-service/change-password", () => {
    test("Should change password", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "test1234",
          newPassword: "test12345",
        });
      expect(changePasswordResponse.status).toBe(200);
      const loginResponse = await request(app)
        .post("/user-service/login")
        .send({
          email: user.body.user.email,
          password: "test12345",
        });
      expect(loginResponse.status).toBe(200);
    });
    test("Should return 401 if not authorized", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", "access-token=test")
        .send({
          oldPassword: "test1234",
          newPassword: "test12345",
        });
      expect(changePasswordResponse.status).toBe(401);
    });
    test("Should return 401 if incorrect password", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "test12345",
          newPassword: "test1234",
        });
      expect(changePasswordResponse.status).toBe(401);
    });
    test("Should return 400 if no old password", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          newPassword: "test12345",
        });
      expect(changePasswordResponse.status).toBe(400);
    });
    test("Should return 400 if no new password", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "test1234",
        });
      expect(changePasswordResponse.status).toBe(400);
    });
    test("Should return 400 if old password length is less than 6", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "",
          newPassword: "test12345",
        });
      expect(changePasswordResponse.status).toBe(400);
    });
    test("Should return 400 if old password length is greater than 256", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "a".repeat(257),
          newPassword: "test12345",
        });
      expect(changePasswordResponse.status).toBe(400);
    });
    test("Should return 400 if new password length is less than 6", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "test1234",
          newPassword: "",
        });
      expect(changePasswordResponse.status).toBe(400);
    });
    test("Should return 400 if new password length is greater than 256", async () => {
      const changePasswordResponse = await request(app)
        .patch("/user-service/change-password")
        .set("Cookie", authToken)
        .send({
          oldPassword: "test1234",
          newPassword: "a".repeat(257),
        });
      expect(changePasswordResponse.status).toBe(400);
    });
  });

  describe("Get/Create user token: POST /user-service/get-token", () => {
    test("Should return user token", async () => {
      const getTokenResponse = await request(app)
        .post("/user-service/get-token")
        .set("Cookie", authToken)
        .send();

      expect(getTokenResponse.status).toBe(201);
    });
    test("Should return 401 if not authorized", async () => {
      const getTokenResponse = await request(app)
        .post("/user-service/get-token")
        .set("Cookie", "access-token=test")
        .send();

      expect(getTokenResponse.status).toBe(401);
    });
  });

  describe("Logout: POST /user-service/logout", () => {
    test("Should logout user", async () => {
      const userDbCheck = await mongoose.model("User").findOne({
        email: user.body.user.email,
      });

      expect(userDbCheck.tokens.length).toBe(1);

      const logoutResponse = await request(app)
        .post("/user-service/logout")
        .set("Cookie", authToken)
        .send();

      const userDbCheck2 = await mongoose.model("User").findOne({
        email: user.body.user.email,
      });

      expect(userDbCheck2.tokens.length).toBe(0);
      expect(logoutResponse.status).toBe(200);
    });
    test("Should return 401 if not authorized", async () => {
      const logoutResponse = await request(app)
        .post("/user-service/logout")
        .set("Cookie", "access-token=test")
        .send();

      expect(logoutResponse.status).toBe(401);
    });
  });
  describe("Logout all: POST /user-service/logout-all", () => {
    test("Should logout all users", async () => {
      await request(app).post("/user-service/login").send({
        email: user.body.user.email,
        password: "test1234",
      });

      const userDbCheck = await mongoose.model("User").findOne({
        email: user.body.user.email,
      });

      expect(userDbCheck.tokens.length).toBe(2);

      const logoutAllResponse = await request(app)
        .post("/user-service/logout-all")
        .set("Cookie", authToken)
        .send();

      const userDbCheck2 = await mongoose.model("User").findOne({
        email: user.body.user.email,
      });

      expect(userDbCheck2.tokens.length).toBe(0);
      expect(logoutAllResponse.status).toBe(200);
    });
  });
});
