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
let folder;
let folder2;
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

    const folderResponse = await request(app)
      .post("/folder-service/create")
      .set("Cookie", authToken)
      .send({
        name: "test",
        parent: "/",
      });

    const folderResponse2 = await request(app)
      .post("/folder-service/create")
      .set("Cookie", authToken2)
      .send({
        name: "test",
        parent: "/",
      });

    expect(folderResponse.status).toBe(201);
    folder = folderResponse.body;

    expect(folderResponse2.status).toBe(201);
    folder2 = folderResponse2.body;
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
    test("Should return user 2's folder info", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/info/${folder2._id}`)
        .set("Cookie", authToken2);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.name).toBe(folder2.name);
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
      const folderResponse = await request(app)
        .get(`/folder-service/info/${folder2._id}`)
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
    test("Should return 400 if title length is greater than 256", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          name: "a".repeat(257),
          parent: "/",
        });

      expect(folderResponse.status).toBe(400);
    });
    test("Should default parent to / if not provided", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          name: "test",
        });

      expect(folderResponse.status).toBe(201);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folderResponse.body._id,
      });

      expect(folderDbCheck.name).toBe(folderResponse.body.name);
      expect(folderDbCheck.parent).toBe("/");
    });
    test("Should correctly create nested folder", async () => {
      const folderResponse = await request(app)
        .post(`/folder-service/create`)
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      expect(folderResponse.status).toBe(201);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folderResponse.body._id,
      });

      expect(folderDbCheck.name).toBe(folderResponse.body.name);
      expect(folderDbCheck.parent).toBe(folder._id);
      expect(folderDbCheck.parentList.length).toBe(2);
      expect(folderDbCheck.parentList[0]).toBe("/");
      expect(folderDbCheck.parentList[1]).toBe(folder._id);
    });
  });

  describe("Rename folder: PATCH /folder-service/rename", () => {
    test("Should rename folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          title: "newname.txt",
        });

      expect(folderResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder._id,
      });

      expect(folderDbCheck.name).toBe("newname.txt");
    });
    test("Should rename user 2's folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken2)
        .send({
          id: folder2._id,
          title: "newname.txt",
        });

      expect(folderResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder2._id,
      });

      expect(folderDbCheck.name).toBe("newname.txt");
    });
    test("Should return 404 if folder not found", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
          title: "newname.txt",
        });

      expect(folderResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", "access-token=test")
        .send({
          id: folder._id,
          title: "newname.txt",
        });

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: folder2._id,
          title: "newname.txt",
        });

      expect([401, 404]).toContain(folderResponse.status);
    });
    test("Should return 400 if no title", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
        });

      expect(folderResponse.status).toBe(400);
    });
    test("Should return 400 if title length is less than 1", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          title: "",
        });

      expect(folderResponse.status).toBe(400);
    });
    test("Should return 400 if title length is greater than 256", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          title: "a".repeat(257),
        });

      expect(folderResponse.status).toBe(400);
    });
    test("Should return 400 if no id", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/rename`)
        .set("Cookie", authToken)
        .send({
          title: "newname.txt",
        });

      expect(folderResponse.status).toBe(400);
    });
  });

  describe("Trash folder: PATCH /folder-service/trash", () => {
    test("Should trash folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
        });

      expect(folderResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder._id,
      });

      expect(folderDbCheck.trashed).toBe(true);
    });
    test("Should trash user 2's folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", authToken2)
        .send({
          id: folder2._id,
        });

      expect(folderResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder2._id,
      });

      expect(folderDbCheck.trashed).toBe(true);
    });
    test("Should return 404 if folder not found", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(folderResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", "access-token=test")
        .send({
          id: folder._id,
        });

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", authToken)
        .send({
          id: folder2._id,
        });

      expect([401, 404]).toContain(folderResponse.status);
    });
    test("Should return 400 if no id", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/trash`)
        .set("Cookie", authToken)
        .send();

      expect(folderResponse.status).toBe(400);
    });
  });

  describe("Restore folder: PATCH /folder-service/restore", () => {
    test("Should restore folder", async () => {
      await mongoose
        .model("Folder")
        .updateOne({ _id: folder._id }, { $set: { trashed: true } });

      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
        });

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.trashed).toBeFalsy();

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder._id,
      });

      expect(folderDbCheck.trashed).toBeFalsy();
    });
    test("Should restore user 2's folder", async () => {
      await mongoose
        .model("Folder")
        .updateOne({ _id: folder2._id }, { $set: { trashed: true } });

      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", authToken2)
        .send({
          id: folder2._id,
        });

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.trashed).toBeFalsy();

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder2._id,
      });

      expect(folderDbCheck.trashed).toBeFalsy();
    });
    test("Should return 404 if folder not found", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
        });

      expect(folderResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", "access-token=test")
        .send({
          id: folder._id,
        });

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", authToken)
        .send({
          id: folder2._id,
        });

      expect([401, 404]).toContain(folderResponse.status);
    });
    test("Should return 400 if no id", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/restore`)
        .set("Cookie", authToken)
        .send();

      expect(folderResponse.status).toBe(400);
    });
  });

  describe("Get folder list: GET /folder-service/list", () => {
    test("Should return folder list", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
    });
    test("Should return user 2's folder list", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", authToken2);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", "access-token=test");

      expect(folderResponse.status).toBe(401);
    });
    test("Should return folders in descending date order/default order", async () => {
      const folder2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", authToken);

      const folderResponse2 = await request(app)
        .get(`/folder-service/list?sortBy=date_desc`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body[0].name).toBe(folder2.body.name);
      expect(folderResponse.body[1].name).toBe(folder.name);

      expect(folderResponse2.status).toBe(200);
      expect(folderResponse2.body[0].name).toBe(folder2.body.name);
      expect(folderResponse2.body[1].name).toBe(folder.name);
    });
    test("Should return folders in ascending date order", async () => {
      const folder2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?sortBy=date_asc`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body[0].name).toBe(folder.name);
      expect(folderResponse.body[1].name).toBe(folder2.body.name);
    });
    test("Should return folders in descending alphabetical order", async () => {
      const folder2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "a",
          parent: "/",
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?sortBy=alp_desc`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body[0].name).toBe(folder.name);
      expect(folderResponse.body[1].name).toBe(folder2.body.name);
    });
    test("Should return folders in ascending alphabetical order", async () => {
      const folder2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "a",
          parent: "/",
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?sortBy=alp_asc`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body[0].name).toBe(folder2.body.name);
      expect(folderResponse.body[1].name).toBe(folder.name);
    });
    test("Should correctly show only home folders", async () => {
      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?parent=/`)
        .set("Cookie", authToken);

      const folderResponse2 = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
      expect(folderResponse.body[0].name).toBe(folder.name);

      expect(folderResponse2.status).toBe(200);
      expect(folderResponse2.body.length).toBe(1);
      expect(folderResponse2.body[0].name).toBe(folder.name);
    });
    test("Should correctly show only sub folders", async () => {
      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?parent=${folder._id}`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
      expect(folderResponse.body[0].name).toBe(folder.name);
    });
    test("Should correctly search for folders", async () => {
      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "newname.txt",
          parent: "/",
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?search=test`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
    });
    test("Should correctly show nested folders search results", async () => {
      await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      const folderResponse = await request(app)
        .get(`/folder-service/list?search=test`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(2);
    });
    test("Should not return items not in the search query", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/list?search=qweqweqwe`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(0);
    });
    test("Should only return trashed folders", async () => {
      const folder2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      await mongoose
        .model("Folder")
        .updateOne({ _id: folder._id }, { $set: { trashed: true } });

      const folderResponse = await request(app)
        .get(`/folder-service/list?trashMode=true`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
      expect(folderResponse.body[0].name).toBe(folder2.body.name);
    });
    test("Should only return folders that belong to the user", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/list`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
      expect(folderResponse.body[0].name).toBe(folder.name);
    });
  });

  describe("Move folder: PATCH /folder-service/move", () => {
    test("Should move a folder", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          parentID: folder2Response.body._id,
        });

      expect(folderResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder._id,
      });

      expect(folderDbCheck.parent).toBe(folder2Response.body._id);
      expect(folderDbCheck.parentList.length).toBe(2);
      expect(folderDbCheck.parentList[0]).toBe("/");
      expect(folderDbCheck.parentList[1]).toBe(folder2Response.body._id);
    });
    test("Should return 404 if folder not found", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: "5f7e5d8d1f962d5a0f5e8a9e",
          parentID: folder2Response.body._id,
        });

      expect(folderResponse.status).toBe(404);
    });
    test("Should return 401 if not authorized", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", "access-token=test")
        .send({
          id: folder._id,
          parentID: folder2Response.body._id,
        });

      expect(folderResponse.status).toBe(401);
    });
    test("Should return 401/404 if not owner of folder", async () => {
      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          parentID: folder2._id,
        });

      expect([401, 404]).toContain(folderResponse.status);
    });
    test("Should also move files in folder", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folder2 = folder2Response.body;

      const file = await mongoose.model("fs.files").create({
        _id: new ObjectId("4eb88f29ecb8c9319ddca3c2"),
        filename: "test.txt2",
        uploadDate: new Date(),
        length: 10000,
        metadata: {
          owner: user.body.user._id,
          parent: folder._id,
          parentList: `/,${folder._id}`,
          hasThumbnail: false,
          size: "10000",
          IV: "test",
          isVideo: false,
        },
      });

      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          parentID: folder2._id,
        });

      expect(folderResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.parent).toBe(folder._id);
      expect(fileDbCheck.metadata.parentList).toBe(
        `/,${folder2._id},${folder._id}`
      );
    });
    test("Should also move subfiles in a folder", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folder2 = folder2Response.body;

      const folder3Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder2._id,
        });

      const folder3 = folder3Response.body;

      const file = await mongoose.model("fs.files").create({
        _id: new ObjectId("4eb88f29ecb8c9319ddca3c2"),
        filename: "test.txt2",
        uploadDate: new Date(),
        length: 10000,
        metadata: {
          owner: user.body.user._id,
          parent: folder3._id,
          parentList: `/,${folder2._id},${folder3._id}`,
          hasThumbnail: false,
          size: "10000",
          IV: "test",
          isVideo: false,
        },
      });

      const folderResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder2._id,
          parentID: folder._id,
        });

      expect(folderResponse.status).toBe(200);

      const fileDbCheck = await mongoose.model("fs.files").findOne({
        _id: file._id,
      });

      expect(fileDbCheck.metadata.parent).toBe(folder3._id);
      expect(fileDbCheck.metadata.parentList).toBe(
        `/,${folder._id},${folder2._id},${folder3._id}`
      );
    });
    test("Should also move folders in a folder", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      const folder2 = folder2Response.body;

      const folder3Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folder3 = folder3Response.body;

      const folderMoveResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          parentID: folder3._id,
        });

      expect(folderMoveResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder2._id,
      });

      expect(folderDbCheck.parent).toBe(folder._id);
      expect(folderDbCheck.parentList[0]).toBe("/");
      expect(folderDbCheck.parentList[1]).toBe(folder3._id);
      expect(folderDbCheck.parentList[2]).toBe(folder._id);
    });
    test("Should also move subfolders in a folder", async () => {
      const folder2Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      const folder2 = folder2Response.body;

      const folder3Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder2._id,
        });

      const folder3 = folder3Response.body;

      const folder4Response = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: "/",
        });

      const folder4 = folder4Response.body;

      const folderMoveResponse = await request(app)
        .patch(`/folder-service/move`)
        .set("Cookie", authToken)
        .send({
          id: folder._id,
          parentID: folder4._id,
        });

      expect(folderMoveResponse.status).toBe(200);

      const folderDbCheck = await mongoose.model("Folder").findOne({
        _id: folder3._id,
      });

      expect(folderDbCheck.parent).toBe(folder2._id);
      expect(folderDbCheck.parentList[0]).toBe("/");
      expect(folderDbCheck.parentList[1]).toBe(folder4._id);
      expect(folderDbCheck.parentList[2]).toBe(folder._id);
      expect(folderDbCheck.parentList[3]).toBe(folder2._id);
    });
  });

  describe("Move folder list: GET /folder-service/move-folder-list", () => {
    test("Should return folder list", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/move-folder-list`)
        .set("Cookie", authToken);

      expect(folderResponse.status).toBe(200);
      expect(folderResponse.body.length).toBe(1);
    });
    test("Should return 401 if not authorized", async () => {
      const folderResponse = await request(app)
        .get(`/folder-service/move-folder-list`)
        .set("Cookie", "access-token=test");

      expect(folderResponse.status).toBe(401);
    });
    test("Should only return folders on the homepage", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "test",
          parent: folder._id,
        });

      expect(folderResponse.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(`/folder-service/move-folder-list`)
        .set("Cookie", authToken);

      const folderMoveListResponse2 = await request(app)
        .get(`/folder-service/move-folder-list?parent=/`)
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse2.status).toBe(200);

      expect(folderMoveListResponse.body.length).toBe(1);
      expect(folderMoveListResponse2.body.length).toBe(1);
    });
    test("Should only return subfolders of a parent", async () => {
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
          name: "test",
          parent: folder._id,
        });

      expect(folderResponse2.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(`/folder-service/move-folder-list?parent=${folder._id}`)
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse.body.length).toBe(1);
    });
    test("Should search for folders", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(`/folder-service/move-folder-list?search=name`)
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse.body.length).toBe(1);
    });
    test("Should show nested folders in search", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name2",
          parent: folder._id,
        });

      expect(folderResponse2.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(`/folder-service/move-folder-list?search=name`)
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse.body.length).toBe(2);
    });
    test("Should not return folders in the folder IDs array", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name",
          parent: "/",
        });

      expect(folderResponse.status).toBe(201);

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name2",
          parent: "/",
        });

      expect(folderResponse2.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(
          `/folder-service/move-folder-list?folderIDs[]=${folder._id}&folderIDs[]=${folderResponse2.body._id}`
        )
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse.body.length).toBe(1);
    });
    test("Should not return sub folders in the folder IDs array", async () => {
      const folderResponse = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name",
          parent: folder._id,
        });

      expect(folderResponse.status).toBe(201);

      const folderResponse2 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name2",
          parent: folderResponse.body._id,
        });

      expect(folderResponse2.status).toBe(201);

      const folderResponse3 = await request(app)
        .post("/folder-service/create")
        .set("Cookie", authToken)
        .send({
          name: "name3",
          parent: "/",
        });

      expect(folderResponse3.status).toBe(201);

      const folderMoveListResponse = await request(app)
        .get(
          `/folder-service/move-folder-list?search=name&folderIDs[]=${folderResponse.body._id}`
        )
        .set("Cookie", authToken);

      expect(folderMoveListResponse.status).toBe(200);
      expect(folderMoveListResponse.body.length).toBe(1);
    });
  });
});
