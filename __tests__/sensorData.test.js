const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Boards");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const User = require("../models/Users");
const SensorData = require("../models/SensorData");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const testAdminId = "testSensorDataAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testSensorDataAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testSensorataUserId";
const testUserName = "Test User";
const testUserEmail = "testSensorDataUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testSensorDataBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "6.6.6.6";
const testBoardImage = "testBoardImage";

const testSensorId = "testSensorDataSensorId";
const testSensorName = "testSensorName";
const testSensorPin = "13";
const testSensorType = "Digital Input";
const testSensorTopic = "testDashboardTopic/";
const testSensorImage = "testSensorImage";

const testSensorDataId = "testSensorDataId";
const testSensorDataData = 999;
const testSensorDataUnit = "testSensorDataUnit";

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

  //   Create test sensor data
  await SensorData.create({
    id: testSensorDataId,
    sensorId: testSensorId,
    data: testSensorDataData,
    unit: testSensorDataUnit,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

  await sequelize.sync();
});

afterAll(async () => {
  await SensorData.destroy({
    where: {
      id: testSensorDataId,
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

describe("Sensor Data APi", () => {
  it("should get all sensor data", async () => {
    const res = await request(app).get("/api/v1/sensorData/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("sensorData");
    expect(res.body).toHaveProperty("count");
    expect(res.body.sensorData[0]).toHaveProperty("id");
    expect(res.body.sensorData[0]).toHaveProperty("sensorId");
    expect(res.body.sensorData[0]).toHaveProperty("data");
    expect(res.body.sensorData[0]).toHaveProperty("unit");
  });

  it("should get a sensor data", async () => {
    const res = await request(app).get(
      `/api/v1/sensorData/${testSensorDataId}`
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body.sensorData).toHaveProperty(
      "sensorDataId",
      testSensorDataId
    );
    expect(res.body.sensorData).toHaveProperty("sensorId", testSensorId);
    expect(res.body.sensorData).toHaveProperty("data", testSensorDataData);
    expect(res.body.sensorData).toHaveProperty("unit", testSensorDataUnit);
  });

  it("should throw an error if sensor data not found when get sensor data", async () => {
    const nonExistSensorDataId = "nonExistSensorDataId";

    const res = await request(app).get(
      `/api/v1/sensorData/${nonExistSensorDataId}`
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No sensor data with id ${nonExistSensorDataId}`
    );
  });

  it("should add a sensor data", async () => {
    // New test sensor data
    const newSensorData = {
      sensorId: testSensorId,
      data: 333,
      unit: "m",
    };

    const res = await request(app)
      .post("/api/v1/sensorData/")
      .send(newSensorData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("sensorData");
    expect(res.body.sensorData).toHaveProperty(
      "sensorDataId",
      res.body.sensorData.sensorDataId
    );
    expect(res.body.sensorData).toHaveProperty(
      "sensorId",
      newSensorData.sensorId
    );
    expect(res.body.sensorData).toHaveProperty("data", newSensorData.data);
    expect(res.body.sensorData).toHaveProperty("unit", newSensorData.unit);

    await SensorData.destroy({
      where: {
        id: res.body.sensorData.sensorDataId,
      },
    });
  });
});
