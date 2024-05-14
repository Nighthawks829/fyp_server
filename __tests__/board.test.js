const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Boards");
const Board = require("../models/Boards");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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

  //   // Create test user 1
  await User.create({
    id: testUserId,
    name: testUserName,
    email: testUserEmail,
    password: testUserPassword,
    role: testUserRole,
    image: testUserImage,
  });

  await Board.create({
    id: testBoardId,
    userId: testAdminId,
    name: testBoardName,
    type: testBoardType,
    location: testBoardLocation,
    ip_address: testBoardIpAddress,
    image: testBoardImage,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

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

  await sequelize.close();
});

describe("Boards API", () => {
  it("should get all boards", async () => {
    const res = await request(app)
      .get("/api/v1/board") 
      .set("Authorization", `Bearer ${token}`); 

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

  it("should get a board", async () => {
    const res = await request(app)
      .get(`/api/v1/board/${testBoardId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.board).toHaveProperty("boardId");
    expect(res.body.board).toHaveProperty("userId");
    expect(res.body.board).toHaveProperty("name");
    expect(res.body.board).toHaveProperty("type");
    expect(res.body.board).toHaveProperty("location");
    expect(res.body.board).toHaveProperty("ip_address");
    expect(res.body.board).toHaveProperty("image");
  });

  it("should throw an error if board not found when get board", async () => {
    const nonExistentBoardId = "nonExistentBoardId";

    const res = await request(app)
      .get(`/api/v1/board/${nonExistentBoardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No board with id ${nonExistentBoardId}`
    );
  });

  it("should add a new board", async () => {
    // New test board configuration
    const newBoard = {
      userId: testAdminId,
      name: "Test board",
      type: "Test type",
      location: "Test location",
      ip_address: "2.2.2.2",
      image: "test image",
    };

    const res = await request(app)
      .post("/api/v1/board")
      .set("Authorization", `Bearer ${token}`)
      .send(newBoard);

    expect(res.statusCode).toEqual(201);
    expect(res.body.board).toHaveProperty("boardId", res.body.board.boardId);
    expect(res.body.board).toHaveProperty("userId", testAdminId);
    expect(res.body.board).toHaveProperty("name", newBoard.name);
    expect(res.body.board).toHaveProperty("type", newBoard.type);
    expect(res.body.board).toHaveProperty("location", newBoard.location);
    expect(res.body.board).toHaveProperty("ip_address", newBoard.ip_address);
    expect(res.body.board).toHaveProperty("image", newBoard.image);
 
    // Delete the test board after test
    Board.destroy({
      where: {
        id: res.body.board.boardId,
      },
    });
  });

  it("should throw an error if user role is not admin when add board", async () => {
    // New test board configuration
    const newBoard = {
      userId: testAdminId,
      name: "Test board",
      type: "Test type",
      location: "Test location",
      ip_address: "2.2.2.2",
      image: "Test image",
    };

    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/v1/board")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBoard);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should update a board", async () => {
    // Updated board configuration
    const updatedBoard = {
      userId: testAdminId,      // board userId did not update
      name: "Update board",
      type: "Update type",
      location: "Update location",
      ip_address: "2.2.2.3",
      image: "Update image",
    };

    const res = await request(app)
      .patch(`/api/v1/board/${testBoardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBoard);

    expect(res.status).toEqual(200);
    expect(res.body.board).toHaveProperty("boardId", testBoardId);
    expect(res.body.board).toHaveProperty("userId", testAdminId);
    expect(res.body.board).toHaveProperty("name", updatedBoard.name);
    expect(res.body.board).toHaveProperty("type", updatedBoard.type);
    expect(res.body.board).toHaveProperty("location", updatedBoard.location);
    expect(res.body.board).toHaveProperty("ip_address", updatedBoard.ip_address);
    expect(res.body.board).toHaveProperty("image", updatedBoard.image);
  });

  it("should throw an error if not all values are provided when update board", async () => {
    const incompleteBoard = {
      userId: testAdminId, // board userId did not update
      // name is missing
      type: "Update type",
      location: "Update location",
      ip_address: "2.2.2.3",
      image: "Update image",
    };

    const res = await request(app)
      .patch(`/api/v1/board/${testBoardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteBoard);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide all values");
  });

  it("should throw an error if user role is not admin when update user", async () => {
    const updatedBoard = {
      userId: testAdminId,
      name: "Update board",
      type: "Update type",
      location: "Update location",
      ip_address: "2.2.2.3",
      image: "Update image",
    };

    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .patch(`/api/v1/board/${testBoardId}`)
      .set("Authotization", `Bearer ${userToken}`)
      .send(updatedBoard);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should delete a board", async () => {
    const res = await request(app)
      .delete(`/api/v1/board/${testBoardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      `Success delete board ${testBoardId}`
    );

    // Verify board is deleted
    const board = await Board.findByPk(testBoardId);
    expect(board).toBeNull();
  });

  it("should throw an erro if borad not found when delete board", async () => {
    const nonExistentBoardId = "nonExistBoardId";

    const res = await request(app)
      .delete(`/api/v1/board/${nonExistentBoardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No board with id ${nonExistentBoardId}`
    );
  });

  it("should throw an error if user role is not admin when delete board", async () => {
    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const res = await request(app)
      .delete(`/api/v1/board/${testBoardId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });
});

