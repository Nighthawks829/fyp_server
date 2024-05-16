const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Boards");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const User = require("../models/Users");
const Dashboard = require("../models/Dashboards");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const testAdminId = "testDashboardAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testDashboardAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testDashboardnUserId";
const testUserName = "Test User";
const testUserEmail = "testDashboardUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testDashboardBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "5.5.5.5";
const testBoardImage = "testBoardImage";

const testSensorId = "testDashboardSensorId";
const testSensorName = "testSensorName";
const testSensorPin = "13";
const testSensorType = "Digital Input";
const testSensorTopic = "testDashboardTopic/";
const testSensorImage = "testSensorImage";

const testDashboardId = "testDashboardId";
const testDashboardName = "testDashboardName";
const testDashboardControl = true;
const testDashboardType = "graph";

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

  //   Create test sensor
  await Sensor.create({
    id: testSensorId,
    boardId: testBoardId,
    name: testSensorName,
    pin: testSensorPin,
    type: testSensorType,
    topic: testSensorTopic,
    image: testSensorImage,
  });

  await Dashboard.create({
    id: testDashboardId,
    userId: testAdminId,
    sensorId: testSensorId,
    name: testDashboardName,
    control: testDashboardControl,
    type: testDashboardType,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

  await sequelize.sync();
});

afterAll(async () => {
  await Dashboard.destroy({
    where: {
      id: testDashboardId,
    },
  });

  await Sensor.destroy({
    where: {
      id: testSensorId,
    },
  });

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

describe("Dashboard API", () => {
  it("should get all dashboards", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("dashboards");
    expect(res.body).toHaveProperty("count");
    expect(res.body.dashboards[0]).toHaveProperty("id");
    expect(res.body.dashboards[0]).toHaveProperty("userId");
    expect(res.body.dashboards[0]).toHaveProperty("sensorId");
    expect(res.body.dashboards[0]).toHaveProperty("name");
    expect(res.body.dashboards[0]).toHaveProperty("control");
    expect(res.body.dashboards[0]).toHaveProperty("type");
  });

  it("should get a dashboard", async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("dashboard");
    expect(res.body.dashboard).toHaveProperty("dashboardId", testDashboardId);
    expect(res.body.dashboard).toHaveProperty("userId", testAdminId);
    expect(res.body.dashboard).toHaveProperty("sensorId", testSensorId);
    expect(res.body.dashboard).toHaveProperty("name", testDashboardName);
    expect(res.body.dashboard).toHaveProperty("control", testDashboardControl);
    expect(res.body.dashboard).toHaveProperty("type", testDashboardType);
  });

  it("should throw an error if dashboard not found when get dashboard", async () => {
    const nonExistDashboardId = "nonExistDashboardId";

    const res = await request(app)
      .get(`/api/v1/dashboard/${nonExistDashboardId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No dashboard with id ${nonExistDashboardId}`
    );
  });

  it("should add a new dashboard", async () => {
    // New dashboard configuration
    const newDashboard = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Dashboard",
      control: false,
      type: "widget",
    };

    const res = await request(app)
      .post("/api/v1/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .send(newDashboard);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("dashboard");
    expect(res.body.dashboard).toHaveProperty(
      "dashboardId",
      res.body.dashboard.dashboardId
    );
    expect(res.body.dashboard).toHaveProperty("userId", newDashboard.userId);
    expect(res.body.dashboard).toHaveProperty(
      "sensorId",
      newDashboard.sensorId
    );
    expect(res.body.dashboard).toHaveProperty("name", newDashboard.name);
    expect(res.body.dashboard).toHaveProperty("control", newDashboard.control);
    expect(res.body.dashboard).toHaveProperty("type", newDashboard.type);

    await Dashboard.destroy({
      where: {
        id: res.body.dashboard.dashboardId,
      },
    });
  });

  it("should update a dashboard", async () => {
    // Update dashboard configuration
    const updatedDashboard = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Dashboard Edit",
      control: false,
      type: "widget",
    };

    const res = await request(app)
      .patch(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedDashboard);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("dashboard");
    expect(res.body.dashboard).toHaveProperty("dashboardId", testDashboardId);
    expect(res.body.dashboard).toHaveProperty(
      "userId",
      updatedDashboard.userId
    );
    expect(res.body.dashboard).toHaveProperty(
      "sensorId",
      updatedDashboard.sensorId
    );
    expect(res.body.dashboard).toHaveProperty("name", updatedDashboard.name);
    expect(res.body.dashboard).toHaveProperty(
      "control",
      updatedDashboard.control
    );
    expect(res.body.dashboard).toHaveProperty("type", updatedDashboard.type);
  });

  it("should throw an error if not all values are provided when update dashboard", async () => {
    // Incomplete dashboard configuration
    const incompleteDashboard = {
      userId: testAdminId,
      sensorId: testSensorId,
      // name is missing
      control: false,
      type: "widget",
    };

    const res = await request(app)
      .patch(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteDashboard);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide all values");
  });

  it("should throw an error if user update other user dashboard", async () => {
    // Update dashboard configuration
    const updatedDashboard = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Dashboard Edit",
      control: false,
      type: "widget",
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
      .patch(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedDashboard);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty(
      "msg",
      "No allow to update other user dashboard"
    );
  });
  
  it("should throw an error when user delete other user dashboard", async () => {
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
      .delete(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${userToken}`);

    console.log(res);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty(
      "msg",
      "No allow to delete other user dashboard"
    );
  });

  it("should delete a dashboard", async () => {
    const res = await request(app)
      .delete(`/api/v1/dashboard/${testDashboardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      `Success delete dashboard ${testDashboardId}`
    );

    // Verify dashboard is deleted
    const dashboard = await Dashboard.findByPk(testDashboardId);
    expect(dashboard).toBeNull();
  });

  it("should throw an error if dashboard not found when delete dashboard", async () => {
    const nonExistDashboardId = "nonExistDashboardId";

    const res = await request(app)
      .delete(`/api/v1/dashboard/${nonExistDashboardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No dashboard with id ${nonExistDashboardId}`
    );
  });
});
