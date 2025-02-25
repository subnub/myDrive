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

  beforeEach(async () => {
    await mongoose.model("fs.files").deleteMany({});
    await mongoose.model("Folder").deleteMany({});

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

    file2 = await mongoose.model("fs.files").create({
      _id: new ObjectId("4eb88f29ecb8c9319ddca3c2"),
      filename: "test.txt2",
      uploadDate: new Date(),
      length: 10000,
      metadata: {
        owner: user2.body.user._id,
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
    test("Should return user 2's file info", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/info/${file2._id}`)
        .set("Cookie", authToken2);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.filename).toBe(file2.filename);
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/info/${file2._id}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should rename user 2's file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken2)
        .send({
          id: file2._id,
          title: "newname.txt",
        });

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.filename).toBe("newname.txt");

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: file2._id,
          title: "newname.txt",
        });

      expect([401, 404]).toContain(fileResponse.status);
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
          title: "a".repeat(257),
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
    test("Should trash user 2's file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken2)
        .send({
          id: file2._id,
        });

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: file2._id,
        });

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should restore user 2's file", async () => {
      await mongoose
        .model("fs.files")
        .updateOne({ _id: file2._id }, { $set: { "metadata.trashed": true } });

      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", authToken2)
        .send({
          id: file2._id,
        });

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.metadata.trashed).toBe(null);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: file2._id,
        });

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should make user 2's file public", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-public/${file2._id}`)
        .set("Cookie", authToken2);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-public/${file2._id}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should make user 2's file one time public", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-one/${file2._id}`)
        .set("Cookie", authToken2);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/make-one/${file2._id}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should make user 2's file private", async () => {
      await mongoose
        .model("fs.files")
        .updateOne(
          { _id: file2._id },
          { $set: { "metadata.link": "test", "metadata.linkType": "public" } }
        );

      const fileResponse = await request(app)
        .patch(`/file-service/remove-link/${file2._id}`)
        .set("Cookie", authToken2);

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
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
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/remove-link/${file2._id}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
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
    test("Should return 404 if file not found", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/public/info/5f7e5d8d1f962d5a0f5e8a9e/test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401/404 if not authorized", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/public/info/${file._id}/abcd`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
    });
    test("Should return 401/404 if not public", async () => {
      const makePublicResponse = await request(app)
        .patch(`/file-service/make-public/${file._id}`)
        .set("Cookie", authToken);

      const tempToken = makePublicResponse.body.token;

      await mongoose
        .model("fs.files")
        .updateOne(
          { _id: file._id },
          { $set: { "metadata.link": null, "metadata.linkType": null } }
        );

      const fileResponse = await request(app)
        .get(`/file-service/public/info/${file._id}/${tempToken}`)
        .set("Cookie", authToken);

      expect([401, 404]).toContain(fileResponse.status);
    });
  });

  describe("Move file: PATCH /file-service/move", () => {
    test("Should move file", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderId = folderResponse.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: folderId,
        });

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.parent).toBe(folderId);
      expect(fileDbCheck.metadata.parentList).toBe(`/,${folderId}`);
    });
    test("Should move user 2's file", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken2)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderId = folderResponse.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken2)
        .send({
          id: file2._id,
          parentID: folderId,
        });

      expect(fileResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file2._id,
      });

      expect(fileDbCheck.metadata.parent).toBe(folderId);
      expect(fileDbCheck.metadata.parentList).toBe(`/,${folderId}`);
    });
    test("Should return 404 if file not found", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderId = folderResponse.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
          parentID: folderId,
        });

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 404 if folder not found", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(fileResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", "access-token=test")
        .send({
          id: file._id,
          parentID: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(fileResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of file", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file2._id,
          parentID: "/",
        });

      expect([401, 404]).toContain(fileResponse.status);
    });
    test("Should not allow moving into folder not owned by user", async () => {
      const userResponse2 = await request(app)
        .post("/user-service/create")
        .send({
          email: "test2@test.com",
          password: "test1234",
        })
        .set("uuid", 12314123123);

      const authToken2 = userResponse2.headers["set-cookie"]
        .map((cookie) => cookie.split(";")[0])
        .join("; ");

      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken2)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderId = folderResponse.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: folderId,
        });

      expect([401, 404]).toContain(fileResponse.status);
    });
    test("Should correctly move into nested folder", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test2",
          parent: folderResponse.body._id,
        });

      expect(folderResponse2.status).toBe(201);

      const folderId = folderResponse2.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: folderId,
        });

      expect(fileResponse.status).toBe(200);

      expect(fileResponse.body.metadata.parent).toBe(folderResponse2.body._id);
      expect(fileResponse.body.metadata.parentList).toBe(
        `/,${folderResponse.body._id},${folderResponse2.body._id}`
      );
    });
    test("Should move file home", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderId = folderResponse.body._id;

      const fileResponse = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: folderId,
        });

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.metadata.parent).toBe(folderId);
      expect(fileResponse.body.metadata.parentList).toBe(`/,${folderId}`);

      const fileResponse2 = await request(app)
        .patch(`/file-service/move`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
          parentID: "/",
        });

      expect(fileResponse2.status).toBe(200);

      expect(fileResponse2.body.metadata.parent).toBe("/");
      expect(fileResponse2.body.metadata.parentList).toBe("/");
    });
  });
  describe("Get quick file list: GET /file-service/quick-list", () => {
    test("Should return quick file list", async () => {
      const quickListResponse = await request(app)
        .get(`/file-service/quick-list`)
        .set("Cookie", authToken);

      expect(quickListResponse.status).toBe(200);
      expect(quickListResponse.body.length).toBe(1);
    });
    test("Should return 401 if not authorized", async () => {
      const quickListResponse = await request(app)
        .get(`/file-service/quick-list`)
        .set("Cookie", "access-token=test");

      expect(quickListResponse.status).toBe(401);
    });
    test("Should return quick file list including files in folders", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const quickListResponse = await request(app)
        .get(`/file-service/quick-list`)
        .set("Cookie", authToken);

      expect(quickListResponse.status).toBe(200);
      expect(quickListResponse.body.length).toBe(2);
    });
    test("Should not return a file that is trashed", async () => {
      const fileResponse = await request(app)
        .patch(`/file-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: file._id,
        });

      expect(fileResponse.status).toBe(200);

      const quickListResponse = await request(app)
        .get(`/file-service/quick-list`)
        .set("Cookie", authToken);

      expect(quickListResponse.status).toBe(200);
      expect(quickListResponse.body.length).toBe(0);
    });
    test("Should return newer files first", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const quickListResponse = await request(app)
        .get(`/file-service/quick-list`)
        .set("Cookie", authToken);

      expect(quickListResponse.status).toBe(200);
      expect(quickListResponse.body[0].filename).toBe("test2.txt");
    });
  });
  describe("Get file list: GET /file-service/list", () => {
    test("Should return file list", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
    test("Should return files in descending date order/default order", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", authToken);

      const fileResponse2 = await request(app)
        .get(`/file-service/list?sortBy=date_desc`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
      expect(fileResponse.body[1].filename).toBe(file.filename);

      expect(fileResponse2.status).toBe(200);
      expect(fileResponse2.body[0].filename).toBe(file2.filename);
      expect(fileResponse2.body[1].filename).toBe(file.filename);
    });
    test("Should return files in ascending date order", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?sortBy=date_asc`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body[0].filename).toBe(file.filename);
      expect(fileResponse.body[1].filename).toBe(file2.filename);
    });
    test("Should return files in descending alphabetical order", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?sortBy=alp_desc`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body[0].filename).toBe(file.filename);
      expect(fileResponse.body[1].filename).toBe(file2.filename);
    });
    test("Should return files in ascending alphabetical order", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?sortBy=alp_asc`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
      expect(fileResponse.body[1].filename).toBe(file.filename);
    });
    test("Should correctly show only home files", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?parent=/`)
        .set("Cookie", authToken);

      const fileResponse2 = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file.filename);

      expect(fileResponse2.status).toBe(200);
      expect(fileResponse2.body.length).toBe(1);
      expect(fileResponse2.body[0].filename).toBe(file.filename);
    });
    test("Should correctly show only folder files", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test2",
          parent: "/",
        });

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c4"),
        filename: "b.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse2.body._id,
          parentList: `/,${folderResponse2.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?parent=${folderResponse.body._id}`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
    });
    test("Should correctly show only file search results", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?search=a`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
    });
    test("Should correctly show nested files search results", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "test1.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?search=test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(2);
    });
    test("Should return 0 files if no search results", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/list?search=asdfasdfkl`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(0);
    });
    test("Should correctly show only trashed files", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
          trashed: true,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list?trashMode=true`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
    });
    test("Should correctly show only trashes files in a folder", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      await request(app)
        .patch("/folder-service/trash")
        .set("Cookie", authToken)
        .send({
          id: folderResponse.body._id,
        });

      expect(folderResponse.status).toBe(201);

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c4"),
        filename: "ab.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
          trashed: true,
        },
      });

      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
          trashed: true,
        },
      });

      const fileResponse = await request(app)
        .get(
          `/file-service/list?parent=${folderResponse.body._id}&trashMode=true`
        )
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file2.filename);
    });
    test("Should only return files that belong to the user", async () => {
      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c3"),
        filename: "a.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user2.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.length).toBe(1);
      expect(fileResponse.body[0].filename).toBe(file.filename);
    });
    test("Should not return file that is processing", async () => {
      await mongoose
        .model("fs.files")
        .updateOne(
          { _id: file._id },
          { $set: { "metadata.processingFile": true } }
        );

      const fileResponse2 = await request(app)
        .get(`/file-service/list`)
        .set("Cookie", authToken);

      expect(fileResponse2.status).toBe(200);
      expect(fileResponse2.body.length).toBe(0);
    });
  });
  describe("Get suggested list: GET /file-service/suggested-list", () => {
    test("Should return suggested list", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(1);
      expect(fileResponse.body.folderList.length).toBe(1);
    });
    test("Should return 401 if not authorized", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test`)
        .set("Cookie", "access-token=test");

      expect(fileResponse.status).toBe(401);
    });
    test("If search is provided should atleast be length of 1", async () => {
      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(400);
    });
    test("Should return nested files and folders", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test2",
          parent: folderResponse.body._id,
        });

      await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c4"),
        filename: "test3.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: folderResponse.body._id,
          parentList: `/,${folderResponse.body._id}`,
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
        },
      });

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(2);
      expect(fileResponse.body.folderList.length).toBe(2);
    });
    test("Should not reutrn items not in the search query", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=qweqweqwe`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(0);
      expect(fileResponse.body.folderList.length).toBe(0);
    });
    test("Should not return files that are processing", async () => {
      await mongoose
        .model("fs.files")
        .updateOne(
          { _id: file._id },
          { $set: { "metadata.processingFile": true } }
        );
      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(0);
    });
    test("Should not return items that are trashed", async () => {
      await mongoose
        .model("fs.files")
        .updateOne({ _id: file._id }, { $set: { "metadata.trashed": true } });

      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      await mongoose
        .model("Folder")
        .updateOne(
          { _id: folderResponse.body._id },
          { $set: { trashed: true } }
        );

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(0);
      expect(fileResponse.body.folderList.length).toBe(0);
    });
    test("Should only return trashed items", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c4"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: false,
          size: "10001",
          IV: "test1",
          isVideo: false,
          trashed: true,
        },
      });

      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test2",
          parent: "/",
        });

      await mongoose
        .model("Folder")
        .updateOne(
          { _id: folderResponse2.body._id },
          { $set: { trashed: true } }
        );

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test&trashMode=true`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(1);
      expect(fileResponse.body.folderList.length).toBe(1);
      expect(fileResponse.body.fileList[0].filename).toBe(file2.filename);
      expect(fileResponse.body.folderList[0].name).toBe(
        folderResponse2.body.name
      );
    });
    test("Should only reutrn moedia items", async () => {
      const file2 = await mongoose.model("fs.files").create({
        _id: new ObjectId("5eb88f29ecb8c9319ddca3c4"),
        filename: "test2.txt",
        uploadDate: new Date(),
        length: 10001,
        metadata: {
          owner: user.body.user._id,
          parent: "/",
          parentList: "/",
          hasThumbnail: true,
          size: "10001",
          IV: "test1",
          isVideo: true,
        },
      });

      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const fileResponse = await request(app)
        .get(`/file-service/suggested-list?search=test&mediaMode=true`)
        .set("Cookie", authToken);

      expect(fileResponse.status).toBe(200);
      expect(fileResponse.body.fileList.length).toBe(1);
      expect(fileResponse.body.fileList[0].filename).toBe(file2.filename);
      expect(fileResponse.body.folderList.length).toBe(0);
    });
  });
});
