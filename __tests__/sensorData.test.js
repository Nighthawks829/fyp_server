const request = require("supertest");
const sequelize = require("../db/connect");
const User = require("../models/Users");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const SensorData = require("../models/SensorData");
const app = require("../app");

const testAdminId = "testBoardAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testBoardAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testSensorataUserId";
const testUserName = "Test User";
const testUserEmail = "testSensorDataUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "1.1.1.1";
const testBoardImage = "testBoardImage";

const testSensorId = "testSensorId";
const testSensorName = "testSensorName";
const testSensorPin = 99;
const testSensorType = "Digital Output";
const testSensorTopic = "testSensorTopic";
const testSensorImage = "testSensorImage";

const testSensorDataId = "testSensorDataId";
const testSensorDataData = 999;
const testSensorDataUnit = "testSensorDataUnit";

describe("Sensor Data API", () => {
  beforeAll(async () => {
    // Create test admin
    await User.create({
      id: testAdminId,
      name: testAdminName,
      email: testAdminEmail,
      password: testAdminPassword,
      role: testAdminRole,
      image: testAdminImage
    });

    // Create test user
    await User.create({
      id: testUserId,
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword,
      role: testUserRole,
      image: testUserImage
    });

    // Create test board
    await Board.create({
      id: testBoardId,
      userId: testAdminId,
      name: testBoardName,
      type: testBoardType,
      location: testBoardLocation,
      ip_address: testBoardIpAddress,
      image: testBoardImage
    });

    //   Create test sensor
    await Sensor.create({
      id: testSensorId,
      boardId: testBoardId,
      name: testSensorName,
      pin: testSensorPin,
      type: testSensorType,
      topic: testSensorTopic,
      image: testSensorImage
    });

    //   Create test sensor data
    await SensorData.create({
      id: testSensorDataId,
      sensorId: testSensorId,
      data: testSensorDataData,
      unit: testSensorDataUnit
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: testAdminEmail,
      password: testAdminPassword
    });

    adminToken = response.body.token;

    // Sign in as user and get user token
    const userResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserEmail,
      password: testUserPassword
    });

    userToken = userResponse.body.token;

    await sequelize.sync();
  });

  afterAll(async () => {
    await SensorData.destroy({
      where: {
        id: testSensorDataId
      }
    });
    await Sensor.destroy({
      where: {
        id: testSensorId
      }
    });

    await Board.destroy({
      where: {
        id: testBoardId
      }
    });

    await User.destroy({
      where: {
        id: testAdminId
      }
    });

    await User.destroy({
      where: {
        id: testUserId
      }
    });

    await sequelize.close();
  });

  describe("Get all sensor data route", () => {
    describe("Given the sensor data exist and user is admin", () => {
      it("should return a 200 and list of sensor data and list length", async () => {
        const res = await request(app)
          .get("/api/v1/sensorData/")
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("sensorData");
        expect(res.body).toHaveProperty("count");
        expect(res.body.sensorData[0]).toHaveProperty("id");
        expect(res.body.sensorData[0]).toHaveProperty("sensorId");
        expect(res.body.sensorData[0]).toHaveProperty("data");
        expect(res.body.sensorData[0]).toHaveProperty("unit");
      });
    });

    describe("Given the sensor data exist and user is normal user", () => {
      it("should return a 200 and list of sensor data and list length", async () => {
        const res = await request(app)
          .get("/api/v1/sensorData/")
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("sensorData");
        expect(res.body).toHaveProperty("count");
        expect(res.body.sensorData[0]).toHaveProperty("id");
        expect(res.body.sensorData[0]).toHaveProperty("sensorId");
        expect(res.body.sensorData[0]).toHaveProperty("data");
        expect(res.body.sensorData[0]).toHaveProperty("unit");
      });
    });

    describe("Given the user is does not have authorization JWT token", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app).get("/api/v1/sensorData/");

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });
  });

  describe("Get sensor data with sensorId", () => {
    describe("Given the sensor data exist and user is admin", () => {
      it("should return a 200 and list of sensor data collect by a sensor", async () => {
        const res = await request(app)
          .get(`/api/v1/sensorData/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.sensorData[0]).toHaveProperty("sensorId", testSensorId);
        expect(res.body.sensorData[0]).toHaveProperty("data");
      });
    });

    describe("Given the sensor data exist and user is normal user", () => {
      it("should return a 200 and list of sensor data collect by a sensor", async () => {
        const res = await request(app)
          .get(`/api/v1/sensorData/${testSensorId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.sensorData[0]).toHaveProperty("sensorId", testSensorId);
        expect(res.body.sensorData[0]).toHaveProperty("data");
      });
    });

    describe("Given the user is does not have authorization JWT token", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app).get(
          `/api/v1/sensorData/${testSensorId}`
        );

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });
  });

  describe("Get latest sensor data with sensor id route", () => {
    describe("Given the sensor data exist and user is admin", () => {
      it("should return a 200 and latest sensor data payload", async () => {
        const res = await request(app)
          .get(`/api/v1/sensorData/latest/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.body.sensorData).toHaveProperty("sensorId", testSensorId);
        expect(res.body.sensorData).toHaveProperty("data", testSensorDataData);
        expect(res.body.sensorData).toHaveProperty("unit", testSensorDataUnit);
      });
    });

    describe("Given the sensor data exist and user is normal user", () => {
      it("should return a 200 and latest sensor data payload", async () => {
        const res = await request(app)
          .get(`/api/v1/sensorData/latest/${testSensorId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.body.sensorData).toHaveProperty("sensorId", testSensorId);
        expect(res.body.sensorData).toHaveProperty("data", testSensorDataData);
        expect(res.body.sensorData).toHaveProperty("unit", testSensorDataUnit);
      });
    });

    describe("Given the user is does not have authorization JWT token", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app).get(
          `/api/v1/sensorData/latest/${testSensorId}`
        );

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });
  });
});
