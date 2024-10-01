const request = require("supertest");
const sequelize = require("../db/connect");
const path = require("path");
const User = require("../models/Users");
const Board = require("../models/Boards");
const app = require("../app");

const testAdminId = "testBoardAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testBoardAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testBoardUserId";
const testUserName = "Test User";
const testUserEmail = "testBoardUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "1.1.1.1";
const testBoardImage = "testBoardImage";

// New test board configuration
const newBoard = {
  userId: testAdminId,
  name: "Test board",
  type: "Test type",
  location: "Test location",
  ip_address: "2.2.2.2",
};

const newBoardImage = "testBoardImage.jpeg";

// Path to the test image file
const testImagePath = path.join(__dirname, "assets", newBoardImage);
const newBoardInvalidImage = "empty.mp3";

// Path to the test image file
const testInvalidImagePath = path.join(
  __dirname,
  "assets",
  newBoardInvalidImage
);

// Updated board configuration
const updatedBoard = {
  userId: testAdminId, // board userId did not update
  name: "Update board",
  type: "Update type",
  location: "Update location",
  ip_address: "2.2.2.3",
};

const updateBoardImage = "testBoardImage2.jpeg";

// Path to the test image file
const testUpdateImagePath = path.join(__dirname, "assets", updateBoardImage);

const updateBoardInvalidImage = "empty.mp3";

// Path to the test image file
const testUpdatetInvalidImagePath = path.join(
  __dirname,
  "assets",
  updateBoardInvalidImage
);

const nonExistentBoardId = "nonExistBoardId";

const existedIPAddress = "1.1.1.1";

let adminToken = "";
let userToken = "";

describe("Board API", () => {
  beforeAll(async () => {
    // Create test admin
    await User.create({
      id: testAdminId,
      name: testAdminName,
      email: testAdminEmail,
      password: testAdminPassword,
      role: testAdminRole,
      image: testAdminImage,
    });

    // Create test user
    await User.create({
      id: testUserId,
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword,
      role: testUserRole,
      image: testUserImage,
    });

    // Create test board
    await Board.create({
      id: testBoardId,
      userId: testAdminId,
      name: testBoardName,
      type: testBoardType,
      location: testBoardLocation,
      ip_address: testBoardIpAddress,
      image: testBoardImage,
    });

    // Sign in admin and get admin token
    const adminResponse = await request(app).post("/api/v1/auth/login").send({
      email: testAdminEmail,
      password: testAdminPassword,
    });

    adminToken = adminResponse.body.token;

    // Sign in as user and get user token
    const userResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserEmail,
      password: testUserPassword,
    });

    userToken = userResponse.body.token;

    // Sync the database before running test
    await sequelize.sync();
  });

  afterAll(async () => {
    await Board.destroy({
      where: {
        id: testBoardId,
      },
    });

    await User.destroy({
      where: {
        id: testAdminId,
      },
    });

    await User.destroy({
      where: {
        id: testUserId,
      },
    });

    // await sequelize.sync();

    await sequelize.close();
  });

  describe("Get all board route", () => {
    describe("Given the boards exist and user is admin", () => {
      it("should return 200 and get list of all boards and list length", async () => {
        const res = await request(app)
          .get("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("boards");
        expect(res.body).toHaveProperty("count");
        expect(res.body.boards[0]).toHaveProperty("id");
        expect(res.body.boards[0]).toHaveProperty("userId");
        expect(res.body.boards[0]).toHaveProperty("name");
        expect(res.body.boards[0]).toHaveProperty("type");
        expect(res.body.boards[0]).toHaveProperty("location");
        expect(res.body.boards[0]).toHaveProperty("ip_address");
        expect(res.body.boards[0]).toHaveProperty("image");
      });
    });
    describe("Given the boards exist and user is normal user", () => {
      it("should return 200 and list of all boards and list length", async () => {
        const res = await request(app)
          .get("/api/v1/board")
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("boards");
        expect(res.body).toHaveProperty("count");
        expect(res.body.boards[0]).toHaveProperty("id");
        expect(res.body.boards[0]).toHaveProperty("userId");
        expect(res.body.boards[0]).toHaveProperty("name");
        expect(res.body.boards[0]).toHaveProperty("type");
        expect(res.body.boards[0]).toHaveProperty("location");
        expect(res.body.boards[0]).toHaveProperty("ip_address");
        expect(res.body.boards[0]).toHaveProperty("image");
      });
    });
  });

  describe("Get board with id route", () => {
    describe("Given the board exist and user is admin", () => {
      it("should return a 200 and board payload", async () => {
        const res = await request(app)
          .get(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.board).toHaveProperty("boardId", testBoardId);
        expect(res.body.board).toHaveProperty("userId", testAdminId);
        expect(res.body.board).toHaveProperty("name", testBoardName);
        expect(res.body.board).toHaveProperty("type", testBoardType);
        expect(res.body.board).toHaveProperty("location", testBoardLocation);
        expect(res.body.board).toHaveProperty("ip_address", testBoardIpAddress);
        expect(res.body.board).toHaveProperty("image", testBoardImage);
      });
    });

    describe("Given the board exist and user is normal user", () => {
      it("should return a 200 and board payload", async () => {
        const res = await request(app)
          .get(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.board).toHaveProperty("boardId", testBoardId);
        expect(res.body.board).toHaveProperty("userId", testAdminId);
        expect(res.body.board).toHaveProperty("name", testBoardName);
        expect(res.body.board).toHaveProperty("type", testBoardType);
        expect(res.body.board).toHaveProperty("location", testBoardLocation);
        expect(res.body.board).toHaveProperty("ip_address", testBoardIpAddress);
        expect(res.body.board).toHaveProperty("image", testBoardImage);
      });
    });

    describe("Given the board is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .get(`/api/v1/board/${nonExistentBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No board with id ${nonExistentBoardId}`
        );
      });
    });
  });

  describe("Add board route", () => {
    describe("Given the new board payload is valid and user is admin", () => {
      it("should return a 201 and board payload", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(201);
        expect(res.body.board).toHaveProperty(
          "boardId",
          res.body.board.boardId
        );
        expect(res.body.board).toHaveProperty("userId", testAdminId);
        expect(res.body.board).toHaveProperty("name", newBoard.name);
        expect(res.body.board).toHaveProperty("type", newBoard.type);
        expect(res.body.board).toHaveProperty("location", newBoard.location);
        expect(res.body.board).toHaveProperty(
          "ip_address",
          newBoard.ip_address
        );
        expect(res.body.board).toHaveProperty("image", newBoardImage);

        // Delete the add test board after test
        Board.destroy({
          where: {
            id: res.body.board.boardId,
          },
        });
      });
    });

    describe("Given the new board payload is valid and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${userToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the board image is invalid", () => {
      it("should return a 400 and invalid image type message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the userId field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Boards userId cannot be null");
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Boards name cannot be null");
      });
    });

    describe("Given the type field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("location", newBoard.location)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Boards type cannot be null");
      });
    });

    describe("Given the location field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("ip_address", newBoard.ip_address)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Boards location cannot be null"
        );
      });
    });

    describe("Given the IP Address field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Boards ip_address cannot be null"
        );
      });
    });

    describe("Given the board IP address is existed", () => {
      it("should return a 400 and not unique error message", async () => {
        const res = await request(app)
          .post("/api/v1/board")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", newBoard.userId)
          .field("name", newBoard.name)
          .field("type", newBoard.type)
          .field("location", newBoard.location)
          .field("ip_address", existedIPAddress)
          .attach("image", testImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "IP address must be unique");
      });
    });
  });

  describe("Update board route", () => {
    describe("Given the update board payload is valid and user is admin", () => {
      it("should return a 200 and board payload", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.status).toEqual(200);
        expect(res.body.board).toHaveProperty("boardId", testBoardId);
        expect(res.body.board).toHaveProperty("userId", testAdminId);
        expect(res.body.board).toHaveProperty("name", updatedBoard.name);
        expect(res.body.board).toHaveProperty("type", updatedBoard.type);
        expect(res.body.board).toHaveProperty(
          "location",
          updatedBoard.location
        );
        expect(res.body.board).toHaveProperty(
          "ip_address",
          updatedBoard.ip_address
        );
        expect(res.body.board).toHaveProperty("image", updateBoardImage);
      });
    });

    describe("Given the update board payload is valid and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the board image is invalid", () => {
      it("should return a 400 and invalid image type message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdatetInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the update board is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${nonExistentBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No board with id ${nonExistentBoardId}`
        );
      });
    });

    describe("Given the userId field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the type field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("location", updatedBoard.location)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the location field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("ip_address", updatedBoard.ip_address)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the IP Address field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("userId", updatedBoard.userId)
          .field("name", updatedBoard.name)
          .field("type", updatedBoard.type)
          .field("location", updatedBoard.location)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });
  });

  describe("Delete board route", () => {
    describe("Given the user is admin", () => {
      it("should return a 200 and successful delete message", async () => {
        const res = await request(app)
          .delete(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty(
          "msg",
          `Success delete board ${testBoardId}`
        );

        // Verify board is deleted
        const board = await Board.findByPk(testBoardId);
        expect(board).toBeNull();
      });
    });

    describe("Given the user is normal user", () => {
      it("shoudl return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/board/${testBoardId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the delete board is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/board/${nonExistentBoardId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No board with id ${nonExistentBoardId}`
        );
      });
    });
  });
});
