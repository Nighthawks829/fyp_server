const request = require("supertest");
const sequelize = require("../db/connect");
const path = require("path");
const User = require("../models/Users");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
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

const testSensorId = "testSensorId";
const testSensorName = "testSensorName";
const testSensorPin = 99;
const testSensorType = "Digital Input";
const testSensorTopic = "testSensorTopic";
const testSensorImage = "testSensorImage";

const nonExistSensorId = "nonExistSensorId";

const newSensor = {
  boardId: testBoardId,
  name: "Test sensor",
  pin: "12",
  type: "Digital Output",
  topic: "testAddTopic/",
  image: "testSensorImage"
};

const newSensorImage = "testBoardImage.jpeg";
const newSensorImagePath = path.join(__dirname, "assets", newSensorImage);

const invalidImage = "empty.mp3";
const testInvalidImagePath = path.join(__dirname, "assets", invalidImage);

const shortSensorName = "a";
const longSensorName =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const invalidSensorType = "InvalidSensorType";

const shortTopicName = "a";
const longTopicName =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const updateSensor = {
  boardId: testBoardId,
  name: "Update sensor",
  pin: "99",
  type: "Digital Input",
  topic: "testUpdateTopic/",
  image: "testSensorImage"
};

const updateSensorImage = "testBoardImage2.jpeg";
const testUpdateImagePath = path.join(__dirname, "assets", updateSensorImage);
const updateSensorInvalidImage = "empty.mp3";
const testUpdatetInvalidImagePath = path.join(
  __dirname,
  "assets",
  updateSensorInvalidImage
);

let adminToken = "";
let userToken = "";

describe("Sensor API", () => {
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

    // Create test sensor
    await Sensor.create({
      id: testSensorId,
      boardId: testBoardId,
      name: testSensorName,
      pin: testSensorPin,
      type: testSensorType,
      topic: testSensorTopic,
      image: testSensorImage
    });

    // Sign in admin and get admin token
    const adminResponse = await request(app).post("/api/v1/auth/login").send({
      email: testAdminEmail,
      password: testAdminPassword
    });

    adminToken = adminResponse.body.token;

    // Sign in as user and get user token
    const userResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserEmail,
      password: testUserPassword
    });

    userToken = userResponse.body.token;

    // Sync the database before running test
    await sequelize.sync();
  });

  afterAll(async () => {
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

  describe("Get all sensor route", () => {
    describe("Given the sensors exist and user is admin", () => {
      it("should return a 200 and list of all sensors and list length", async () => {
        const res = await request(app)
          .get("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`);

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
    });

    describe("Given the sensors exist and user is normal user", () => {
      it("should return a 200 and list of all sensors and list length", async () => {
        const res = await request(app)
          .get("/api/v1/sensor")
          .set("Authorization", `Bearer ${userToken}`);

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
    });
  });

  describe("Get sensor with id route", () => {
    describe("Given the sensor exist and user is admin", () => {
      it("should return a 200 and sensor payload", async () => {
        const res = await request(app)
          .get(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

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
    });

    describe("Given the sensor exist and user is normal user", () => {
      it("should return a 200 and sensor payload", async () => {
        const res = await request(app)
          .get(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${userToken}`);

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
    });

    describe("Given the sensor is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .get(`/api/v1/sensor/${nonExistSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No sensor with id ${nonExistSensorId}`
        );
      });
    });
  });

  describe("Add sensor route", () => {
    describe("Given the new sensor payload is valid and user is admin", () => {
      it("should return a 201 and sensor payload", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

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
        expect(res.body.sensor).toHaveProperty("image", newSensorImage);

        await Sensor.destroy({
          where: {
            id: res.body.sensor.sensorId
          }
        });
      });
    });

    describe("Given the new sensor payload is valid and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${userToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the sensor image is invalid", () => {
      it("should return a 400 and invalid image type message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", testInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the boardId field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Sensors boardId cannot be null"
        );
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Sensors name cannot be null");
      });
    });

    describe("Given the pin field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Sensors pin cannot be null");
      });
    });

    describe("Given the type field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Sensors type cannot be null");
      });
    });

    describe("Given the topic field is missing", () => {
      it("should retun a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Sensors topic cannot be null");
      });
    });

    describe("Given the name is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", shortSensorName)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Sensor name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the name is longer than 50 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", longSensorName)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Sensor name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the type is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", invalidSensorType)
          .field("topic", newSensor.topic)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid type value. Please select the valid status"
        );
      });
    });

    describe("Given the topic is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", shortTopicName)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Topic length should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the topic is longer than 100 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/sensor")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", newSensor.boardId)
          .field("name", newSensor.name)
          .field("pin", newSensor.pin)
          .field("type", newSensor.type)
          .field("topic", longTopicName)
          .attach("image", newSensorImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Topic length should be between 2 and 100 characters"
        );
      });
    });
  });

  describe("Update sensor route", () => {
    describe("Given the update sensor payload is valid and user is admin", () => {
      it("should return a 200 and sensor payload", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("sensor");
        expect(res.body.sensor).toHaveProperty("sensorId", testSensorId);
        expect(res.body.sensor).toHaveProperty("boardId", testBoardId);
        expect(res.body.sensor).toHaveProperty("name", updateSensor.name);
        expect(res.body.sensor).toHaveProperty("pin", updateSensor.pin);
        expect(res.body.sensor).toHaveProperty("type", updateSensor.type);
        expect(res.body.sensor).toHaveProperty("topic", updateSensor.topic);
        expect(res.body.sensor).toHaveProperty("image", updateSensorImage);
      });
    });

    describe("Given the update sensor payload is valid and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the sensor image is invalid", () => {
      it("shold return a 400 and invalud image type message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdatetInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the update sensor is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${nonExistSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No sensor with id ${nonExistSensorId}`
        );
      });
    });

    describe("Given the boardId field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the pin field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the type field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the topic field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the name is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", shortSensorName)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Sensor name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the name is longer than 50 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", longSensorName)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Sensor name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the type is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", invalidSensorType)
          .field("topic", updateSensor.topic)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid type value. Please select the valid status"
        );
      });
    });

    describe("Given the topic is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", shortTopicName)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Topic length should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the topic is shorter than 100 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("boardId", updateSensor.boardId)
          .field("name", updateSensor.name)
          .field("pin", updateSensor.pin)
          .field("type", updateSensor.type)
          .field("topic", longTopicName)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Topic length should be between 2 and 100 characters"
        );
      });
    });
  });

  describe("Delete sensor route", () => {
    describe("Given the user is admin", () => {
      it("should return a 200 and successful delete message", async () => {
        const res = await request(app)
          .delete(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty(
          "msg",
          `Success delete sensor ${testSensorId}`
        );

        // Verify board is deleted
        const sensor = await Sensor.findByPk(testSensorId);
        expect(sensor).toBeNull();
      });
    });

    describe("Given the user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/sensor/${testSensorId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the delete sensor is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/sensor/${nonExistSensorId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No sensor with id ${nonExistSensorId}`
        );
      });
    });
  });

  // TODO: getSensorWithSensorControls
  // TODO: getSensorWithSensorData
  // TODO: getSensorWithDashboards
  // TODO: getSensorWithNotifications
});
