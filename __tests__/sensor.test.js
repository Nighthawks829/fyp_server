const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Sensors");
const Sensor = require("../models/Sensors");
const Board = require("../models/Boards");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const testAdminId = "testSensorAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testSensorAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testSensorUserId";
const testUserName = "Test User";
const testUserEmail = "testSensorUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testSensorBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "3.3.3.3";
const testBoardImage = "testBoardImage";

const testSensorId = "testSensorId";
const testSensorName = "testSensorName";
const testSensorPin = "13";
const testSensorType = "Digital Input";
const testSensorTopic = "testTopic/";
const testSensorImage = "testSensorImage";

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

  await Board.create({
    id: testBoardId,
    userId: testAdminId,
    name: testBoardName,
    type: testBoardType,
    location: testBoardLocation,
    ip_address: testBoardIpAddress,
    image: testBoardImage,
  });

  await Sensor.create({
    id: testSensorId,
    boardId: testBoardId,
    name: testSensorName,
    pin: testSensorPin,
    type: testSensorType,
    topic: testSensorTopic,
    image: testSensorImage,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

  await sequelize.sync();
});

afterAll(async () => {
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

describe("Sensor APi", () => {
  it("should get all sensors", async () => {
    const res = await request(app)
      .get("/api/v1/sensor")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("sensors");
    expect(res.body).toHaveProperty("count");
    expect(res.body.sensors[0]).toHaveProperty("id");
    expect(res.body.sensors[0]).toHaveProperty("boardId");
    expect(res.body.sensors[0]).toHaveProperty("name");
    expect(res.body.sensors[0]).toHaveProperty("pin");
    expect(res.body.sensors[0]).toHaveProperty("type");
    expect(res.body.sensors[0]).toHaveProperty("topic");
    expect(res.body.sensors[0]).toHaveProperty("image");
  });

  it("should get a sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("sensor");
    expect(res.body.sensor).toHaveProperty("sensorId");
    expect(res.body.sensor).toHaveProperty("boardId");
    expect(res.body.sensor).toHaveProperty("name");
    expect(res.body.sensor).toHaveProperty("pin");
    expect(res.body.sensor).toHaveProperty("type");
    expect(res.body.sensor).toHaveProperty("topic");
    expect(res.body.sensor).toHaveProperty("image");
  });

  it("should throw an error if sensor not found when get sensor", async () => {
    const nonExistSensorId = "nonExistSensorId";

    const res = await request(app)
      .get(`/api/v1/sensor/${nonExistSensorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No sensor with id ${nonExistSensorId}`
    );
  });

  it("should add a new sensor", async () => {
    // New test sensor configuration
    const newSensor = {
      boardId: testBoardId,
      name: "Test board",
      pin: 12,
      type: "Digital Output",
      topic: "testAddTopic/",
      image: "testSensorImage",
    };

    const res = await request(app)
      .post("/api/v1/sensor")
      .set("Authorization", `Bearer ${token}`)
      .send(newSensor);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("sensor");
    expect(res.body.sensor).toHaveProperty(
      "sensorId",
      res.body.sensor.sensorId
    );
    expect(res.body.sensor).toHaveProperty("boardId", testBoardId);
    expect(res.body.sensor).toHaveProperty("name", newSensor.name);
    expect(res.body.sensor).toHaveProperty("pin", newSensor.pin);
    expect(res.body.sensor).toHaveProperty("type", newSensor.type);
    expect(res.body.sensor).toHaveProperty("topic", newSensor.topic);
    expect(res.body.sensor).toHaveProperty("image", newSensor.image);

    Sensor.destroy({
      where: {
        id: res.body.sensor.sensorId,
      },
    });
  });

  it("should throw an error if user role is not admin when add sensor", async () => {
    // New test sensor configuration
    const newSensor = {
      boardId: testBoardId,
      name: "Test board",
      pin: 12,
      type: "Digital Output",
      topic: "testAddTopic/",
      image: "testSensorImage",
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
      .post("/api/v1/sensor")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newSensor);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should update a sensor", async () => {
    // Update sensor configuration
    const updatedSensor = {
      boardId: testBoardId,
      name: "Test board Update",
      pin: 12,
      type: "Digital Output",
      topic: "testAddTopic/Update",
      image: "testSensorImageUpdate",
    };

    const res = await request(app)
      .patch(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedSensor);

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("sensor");
    expect(res.body.sensor).toHaveProperty("sensorId", testSensorId);
    expect(res.body.sensor).toHaveProperty("boardId", testBoardId);
    expect(res.body.sensor).toHaveProperty("name", updatedSensor.name);
    expect(res.body.sensor).toHaveProperty("pin", updatedSensor.pin);
    expect(res.body.sensor).toHaveProperty("type", updatedSensor.type);
    expect(res.body.sensor).toHaveProperty("topic", updatedSensor.topic);
    expect(res.body.sensor).toHaveProperty("image", updatedSensor.image);
  });

  it("should throw an error if not all values are provided when updated sensor", async () => {
    const incompleteSensor = {
      boardId: testBoardId,
      // name is missing
      pin: 12,
      type: "Digital Output",
      topic: "testAddTopic/Update",
      image: "testSensorImageUpdate",
    };

    const res = await request(app)
      .patch(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteSensor);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide all values");
  });

  it("should throw an error if user role is not admin when update sensor", async () => {
    // Update sensor configuration
    const updatedSensor = {
      boardId: testBoardId,
      name: "Test board Update",
      pin: 12,
      type: "Digital Output",
      topic: "testAddTopic/Update",
      image: "testSensorImageUpdate",
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
      .patch(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedSensor);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should delete a sensor", async () => {
    const res = await request(app)
      .delete(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      `Success delete sensor ${testSensorId}`
    );
  });

  it("should throw an error if sensor not found when delete sensor", async () => {
    const nonExistSensorId = "nonExistSensorId";

    const res = await request(app)
      .delete(`/api/v1/sensor/${nonExistSensorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No sensor with id ${nonExistSensorId}`
    );
  });

  it("should throw an erro if user role is not admin when delete sensor", async () => {
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
      .delete(`/api/v1/sensor/${testSensorId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });
});
