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
let file;
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

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.filename).toBe(file.filename);
      expect(fileResponse.body.length).toBe(file.length);
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/info/5f7e5d8d1f962d5a0f5e8a9e`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/info/${file._id}`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
  });

  describe("File rename: PATCH /file-service/rename", () => {
    test("Should rename file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          title: "newname.txt",
        });

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.filename).toBe("newname.txt");

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.filename).toBe("newname.txt");
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
          title: "newname.txt",
        });

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", "access-token=test")
        .send({
          id: file._id,
          title: "newname.txt",
        });

      expect(fileResponse.status).toBe(401);
    });
    test("Should return 400 if no title", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(400);
    });
    test("Should return 400 if title length is less than 1", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          title: "",
        });

      expect(fileResponse.status).toBe(400);
    });
    test("Should return 400 if title length is greater than 256", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          title: "a" * 257,
        });

      expect(fileResponse.status).toBe(400);
    });
    test("Should return 400 if no id", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          title: "newname.txt",
        });

      expect(fileResponse.status).toBe(400);
    });
  });

  describe("Trash file: PATCH /file-service/trash", () => {
    test("Should trash file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.trashed).toBe(true);
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", "access-token=test")
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(401);
    });
    test("Should return 400 if no id", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken)
        .send();

      expect(fileResponse.status).toBe(400);
    });
  });

  describe("Restore file: PATCH /file-service/restore", () => {
    test("Should restore file", async () => {
      await mongoose
        .model("fs.files")
        .updateOne({ _id: file._id }, { $set: { "metadata.trashed": true } });

      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.metadata.trashed).toBe(null);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.trashed).toBe(null);
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", "access-token=test")
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(401);
    });
    test("Should return 400 if no id", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", authToken)
        .send();

      expect(fileResponse.status).toBe(400);
    });
  });

  describe("Make public file: PATCH /file-service/make-public", () => {
    test("Should make file public", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-public/${file._id}`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.link).toBeTruthy();
      expect(fileDbCheck.metadata.linkType).toBe("public");
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-public/5f7e5d8d1f962d5a0f5e8a9e`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-public/${file._id}`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
  });

  describe("Make one time public file: PATCH /file-service/make-one/", () => {
    test("Should make file one time public", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-one/${file._id}`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.link).toBeTruthy();
      expect(fileDbCheck.metadata.linkType).toBe("one");
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-one/5f7e5d8d1f962d5a0f5e8a9e`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-one/${file._id}`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
  });

  describe("Make private file: PATCH /file-service/remove-link/:id", () => {
    test("Should make file private", async () => {
      await mongoose
        .model("fs.files")
        .updateOne(
          { _id: file._id },
          { $set: { "metadata.link": "test", "metadata.linkType": "public" } }
        );

      const fileResponse = await request(app)
        .patch(`/file-service/remove-link/${file._id}`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.link).toBeFalsy();
      expect(fileDbCheck.metadata.linkType).toBeFalsy();
    });
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/remove-link/5f7e5d8d1f962d5a0f5e8a9e`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/remove-link/${file._id}`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
  });

  describe("Get public file info: GET /file-service/public/info/:id/:tempToken", () => {
    test("Should return public file info", async () => {
      const makePublicResponse = await request(app)
        .patch(`/file-service/make-public/${file._id}`)
        .set("Cookie", authToken);

      const tempToken = makePublicResponse.body.token;

      const fileResponse = await request(app)
        .get(`/file-service/public/info/${file._id}/${tempToken}`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(file.filename === fileResponse.body.filename).toBeTruthy();
    });
  });
});
