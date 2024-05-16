const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Boards");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const User = require("../models/Users");
const SensorControl = require("../models/SensorControls");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const testAdminId = "testSensorControlAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testSensorControlAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testSensorControlUserId";
const testUserName = "Test User";
const testUserEmail = "testSensorControlUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testSensorControlBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "7.7.7.7";
const testBoardImage = "testBoardImage";

const testSensorId = "testSensorControlSensorId";
const testSensorName = "testSensorName";
const testSensorPin = "13";
const testSensorType = "Digital Input";
const testSensorTopic = "testSensorControlTopic/";
const testSensorImage = "testSensorImage";

const testSensorControlId = "testSensorControlId";
const testSensorControlValue = 1024;

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

  //   Create test sensor control
  await SensorControl.create({
    id: testSensorControlId,
    userId: testAdminId,
    sensorId: testSensorId,
    value: testSensorControlValue,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

  await sequelize.sync();
});

afterAll(async () => {
  await SensorControl.destroy({
    where: {
      id: testSensorControlId,
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

describe("Sensor Control API", () => {
  it("should get all sensor controls", async () => {
    const res = await request(app).get("/api/v1/sensorControl");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("sensorControls");
    expect(res.body).toHaveProperty("count");
    expect(res.body.sensorControls[0]).toHaveProperty("id");
    expect(res.body.sensorControls[0]).toHaveProperty("userId");
    expect(res.body.sensorControls[0]).toHaveProperty("sensorId");
    expect(res.body.sensorControls[0]).toHaveProperty("value");
  });

  it("should get a sensor controls", async () => {
    const res = await request(app).get(
      `/api/v1/sensorControl/${testSensorControlId}`
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("sensorControl");
    expect(res.body.sensorControl).toHaveProperty("userId", testAdminId);
    expect(res.body.sensorControl).toHaveProperty("sensorId", testSensorId);
    expect(res.body.sensorControl).toHaveProperty(
      "value",
      testSensorControlValue
    );
  });

  it("should throw an error if sensor control not found when get sensor control", async () => {
    const nonExistSensorControlId = "nonExistSensorControlId";

    const res = await request(app).get(
      `/api/v1/sensorControl/${nonExistSensorControlId}`
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No sensor control with id ${nonExistSensorControlId}`
    );
  });

  it("should add a sensor control", async () => {
    // New test sensor control
    const newSensorControl = {
      sensorId: testSensorId,
      userId: testAdminId,
      value: 200,
    };

    const res = await request(app)
      .post("/api/v1/sensorControl/")
      .set("Authorization", `Bearer ${token}`)
      .send(newSensorControl);

    expect(res.body.sensorControl).toHaveProperty(
      "sensorControlId",
      res.body.sensorControl.sensorControlId
    );
    expect(res.body.sensorControl).toHaveProperty(
      "userId",
      newSensorControl.userId
    );
    expect(res.body.sensorControl).toHaveProperty(
      "sensorId",
      newSensorControl.sensorId
    );
    expect(res.body.sensorControl).toHaveProperty(
      "value",
      newSensorControl.value
    );

    await SensorControl.destroy({
      where: {
        id: res.body.sensorControl.sensorControlId,
      },
    });
  });

  it("should throw an error if user role is not admin when add sensor control", async () => {
    // New test sensor control
    const newSensorControl = {
      sensorId: testSensorId,
      userId: testAdminId,
      value: 200,
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
      .post("/api/v1/sensorControl")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newSensorControl);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });
});
