const request = require("supertest");
const sequelize = require("../db/connect");
const User = require("../models/Users");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const Notification = require("../models/Notifications");
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

const testNotificationId = "testNotificationId";
const testNotificatioName = "testNotificationName";
const testNotificationMessage = "testNotificationMessage";
const testNotificationThreshold = 999;
const testNotificationCondition = "bigger";
const testNotificationPlatform = "email";
const testNotificationAddress = "notification@gmail.com";

const testNotificationId2 = "testNotificationId2";
const testNotificatioName2 = "testNotificationName2";
const testNotificationMessage2 = "testNotificationMessage2";
const testNotificationThreshold2 = 100;
const testNotificationCondition2 = "lower";
const testNotificationPlatform2 = "telegram";
const testNotificationAddress2 = "12345";

const fixedNotificationId = "fixedNotificationId";
const fixedNotificatioName = "fixedNotificationName2";
const fixedNotificationMessage = "fixedNotificationMessage2";
const fixedNotificationThreshold = 300;
const fixedNotificationCondition = "equal";
const fixedNotificationPlatform = "email";
const fixedNotificationAddress = "notification@gmail.com";

const nonExistNotificationId = "nonExistNotificationId";

const newNotification = {
  sensorId: testSensorId,
  name: "Test Notification",
  message: "Test Message",
  threshold: 999,
  condition: "lower",
  platform: "telegram",
  address: "testTelegramBotId"
};

const shortNotificationName = "a";
const longNotificationName =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const invalidCondition = "invalidCondition";
const invalidPlatform = "invalidPlatform";
const invalidThresholdValue = "invalidThresholdValue";
const invalidSensorId = "invalidSensorId";

const updatedNotification = {
  sensorId: testSensorId,
  name: "Test Update Notification",
  message: "Test Update Message",
  threshold: 999,
  condition: "bigger",
  platform: "email",
  address: "example@gmail.com"
};

describe("Notification API", () => {
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

    await Notification.create({
      id: testNotificationId,
      userId: testAdminId,
      sensorId: testSensorId,
      name: testNotificatioName,
      message: testNotificationMessage,
      threshold: testNotificationThreshold,
      condition: testNotificationCondition,
      platform: testNotificationPlatform,
      address: testNotificationAddress
    });

    await Notification.create({
      id: testNotificationId2,
      userId: testUserId,
      sensorId: testSensorId,
      name: testNotificatioName2,
      message: testNotificationMessage2,
      threshold: testNotificationThreshold2,
      condition: testNotificationCondition2,
      platform: testNotificationPlatform2,
      address: testNotificationAddress2
    });

    await Notification.create({
      id: fixedNotificationId,
      userId: testAdminId,
      sensorId: testSensorId,
      name: fixedNotificatioName,
      message: fixedNotificationMessage,
      threshold: fixedNotificationThreshold,
      condition: fixedNotificationCondition,
      platform: fixedNotificationPlatform,
      address: fixedNotificationAddress
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
    await Notification.destroy({
      where: {
        id: testNotificationId2
      }
    });

    await Notification.destroy({
      where: {
        id: testNotificationId
      }
    });

    await Notification.destroy({
      where: {
        id: fixedNotificationId
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

  describe("Get all notifications route", () => {
    describe("Given the notifications exist and user is admin", () => {
      it("should return a 200 and list of all notifcations and list length created by own", async () => {
        const res = await request(app)
          .get("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notifications");
        expect(res.body).toHaveProperty("count");
        expect(res.body.notifications[0]).toHaveProperty("id");
        expect(res.body.notifications[0]).toHaveProperty("userId", testAdminId);
        expect(res.body.notifications[0]).toHaveProperty("sensorId");
        expect(res.body.notifications[0]).toHaveProperty("name");
        expect(res.body.notifications[0]).toHaveProperty("message");
        expect(res.body.notifications[0]).toHaveProperty("threshold");
        expect(res.body.notifications[0]).toHaveProperty("condition");
        expect(res.body.notifications[0]).toHaveProperty("platform");
        expect(res.body.notifications[0]).toHaveProperty("address");
        expect(res.body.notifications[0]).toHaveProperty("sensorName");
      });
    });

    describe("Given the notifcations exist and user is normal user", () => {
      it("should return a 200 and list of all notifcations and list length created by own", async () => {
        const res = await request(app)
          .get("/api/v1/notification")
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notifications");
        expect(res.body).toHaveProperty("count");
        expect(res.body.notifications[0]).toHaveProperty("id");
        expect(res.body.notifications[0]).toHaveProperty("userId", testUserId);
        expect(res.body.notifications[0]).toHaveProperty("sensorId");
        expect(res.body.notifications[0]).toHaveProperty("name");
        expect(res.body.notifications[0]).toHaveProperty("message");
        expect(res.body.notifications[0]).toHaveProperty("threshold");
        expect(res.body.notifications[0]).toHaveProperty("condition");
        expect(res.body.notifications[0]).toHaveProperty("platform");
        expect(res.body.notifications[0]).toHaveProperty("address");
        expect(res.body.notifications[0]).toHaveProperty("sensorName");
      });
    });
  });

  describe("Get notification with id route", () => {
    describe("Given the notification exist and user is admin that created the notification", () => {
      it("should return a 200 and notification payload with userId is the own userId", async () => {
        const res = await request(app)
          .get(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty("userId", testAdminId);
        expect(res.body.notification).toHaveProperty("sensorId", testSensorId);
        expect(res.body.notification).toHaveProperty(
          "name",
          testNotificatioName
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          testNotificationMessage
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          testNotificationThreshold
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          testNotificationCondition
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          testNotificationPlatform
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          testNotificationAddress
        );
        expect(res.body.notification).toHaveProperty(
          "sensorName",
          testSensorName
        );
      });
    });

    describe("Given the notification exist and user is normal user that created the notification", () => {
      it("should return a 200 and notification payload with userId with the own userId", async () => {
        const res = await request(app)
          .get(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty("userId", testUserId);
        expect(res.body.notification).toHaveProperty("sensorId", testSensorId);
        expect(res.body.notification).toHaveProperty(
          "name",
          testNotificatioName2
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          testNotificationMessage2
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          testNotificationThreshold2
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          testNotificationCondition2
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          testNotificationPlatform2
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          testNotificationAddress2
        );
        expect(res.body.notification).toHaveProperty(
          "sensorName",
          testSensorName
        );
      });
    });

    describe("Given the admin get the notification cretaed by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .get(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to get other user notifications"
        );
      });
    });

    describe("Given the normal user get the notification cretaed by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .get(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to get other user notifications"
        );
      });
    });

    describe("Given the notification is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .get(`/api/v1/notification/${nonExistNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No notification with id ${nonExistNotificationId}`
        );
      });
    });
  });

  describe("Add notification route", () => {
    describe("Given the notification payload is valid and user is admin", () => {
      it("should return a 201 and notification payload", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(newNotification);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty(
          "notificationId",
          res.body.notification.notificationId
        );
        expect(res.body.notification).toHaveProperty("userId", testAdminId);
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          newNotification.sensorId
        );
        expect(res.body.notification).toHaveProperty(
          "name",
          newNotification.name
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          newNotification.message
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          newNotification.threshold
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          newNotification.condition
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          newNotification.platform
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          newNotification.address
        );
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          newNotification.sensorId
        );

        await Notification.destroy({
          where: {
            id: res.body.notification.notificationId
          }
        });
      });
    });

    describe("Given the notification payload is valid and user is normal user", () => {
      it("should return a 201 and notification payload", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${userToken}`)
          .send(newNotification);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty(
          "notificationId",
          res.body.notification.notificationId
        );
        expect(res.body.notification).toHaveProperty("userId", testUserId);
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          newNotification.sensorId
        );
        expect(res.body.notification).toHaveProperty(
          "name",
          newNotification.name
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          newNotification.message
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          newNotification.threshold
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          newNotification.condition
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          newNotification.platform
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          newNotification.address
        );
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          newNotification.sensorId
        );

        await Notification.destroy({
          where: {
            id: res.body.notification.notificationId
          }
        });
      });
    });

    describe("Given the notification sensorId is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications sensorId cannot be null"
        );
      });
    });

    describe("Given the notification name is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications name cannot be null"
        );
      });
    });

    describe("Given the notification message is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications message cannot be null"
        );
      });
    });

    describe("Given the notification threshold is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications threshold cannot be null"
        );
      });
    });

    describe("Given the notification condition is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications condition cannot be null"
        );
      });
    });

    describe("Given the notification platform is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications platform cannot be null"
        );
      });
    });

    describe("Given the notification address is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notifications address cannot be null"
        );
      });
    });

    describe("Given the sensorId is not valid", () => {
      it("should return a 400 and foreign key constraint error", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", invalidSensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "This sensor cannot be add because it has foreign key constraint fails"
        );
      });
    });

    describe("Given the notification name is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", shortNotificationName)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notification name should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the notification name is longer than 100 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", longNotificationName)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notification name should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the threshold value is not numeric value", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", invalidThresholdValue)
          .field("condition", newNotification.condition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Threshold value shoule be numeric value"
        );
      });
    });

    describe("Given the notification condition is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", invalidCondition)
          .field("platform", newNotification.platform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid condition value. Please select the valid status"
        );
      });
    });

    describe("Given the notification platform is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/notification")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", newNotification.sensorId)
          .field("name", newNotification.name)
          .field("message", newNotification.message)
          .field("threshold", newNotification.threshold)
          .field("condition", newNotification.condition)
          .field("platform", invalidPlatform)
          .field("address", newNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid platform value. Please select the valid status"
        );
      });
    });
  });

  describe("Update notification route", () => {
    describe("Given the notification payload is valid and user is admin that created the notification", () => {
      it("should return a 201 and notification payload", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(updatedNotification);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty("userId", testAdminId);
        expect(res.body.notification).toHaveProperty("sensorId", testSensorId);
        expect(res.body.notification).toHaveProperty(
          "name",
          updatedNotification.name
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          updatedNotification.message
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          updatedNotification.threshold
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          updatedNotification.condition
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          updatedNotification.platform
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          updatedNotification.address
        );
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          updatedNotification.sensorId
        );
      });
    });

    describe("Given the notification payload is valid and user is normal user that created the notification", () => {
      it("should return a 201 and notification payload", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(updatedNotification);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("notification");
        expect(res.body.notification).toHaveProperty("userId", testUserId);
        expect(res.body.notification).toHaveProperty("sensorId", testSensorId);
        expect(res.body.notification).toHaveProperty(
          "name",
          updatedNotification.name
        );
        expect(res.body.notification).toHaveProperty(
          "message",
          updatedNotification.message
        );
        expect(res.body.notification).toHaveProperty(
          "threshold",
          updatedNotification.threshold
        );
        expect(res.body.notification).toHaveProperty(
          "condition",
          updatedNotification.condition
        );
        expect(res.body.notification).toHaveProperty(
          "platform",
          updatedNotification.platform
        );
        expect(res.body.notification).toHaveProperty(
          "address",
          updatedNotification.address
        );
        expect(res.body.notification).toHaveProperty(
          "sensorId",
          updatedNotification.sensorId
        );
      });
    });

    describe("Given the admin update notification created by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(updatedNotification);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to update other user notification"
        );
      });
    });
    describe("Given the normal user update notification created by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(updatedNotification);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to update other user notification"
        );
      });
    });

    describe("Given the update notification is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${nonExistNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(updatedNotification);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No notification with id ${nonExistNotificationId}`
        );
      });
    });

    describe("Given the notification sensorId is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification name is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification message is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification threshold is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification condition is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification platform is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the notification address is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the sensorId is not valid", () => {
      it("should return a 400 and foreign key constraint error", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", invalidSensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "This sensor cannot be add because it has foreign key constraint fails"
        );
      });
    });

    describe("Given the notification name is shorter than 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", shortNotificationName)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notification name should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the notification name is longer than 100 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", longNotificationName)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Notification name should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the threshold value is not numeric value", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", invalidThresholdValue)
          .field("condition", updatedNotification.condition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Threshold value shoule be numeric value"
        );
      });
    });
    describe("Given the notification condition is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", invalidCondition)
          .field("platform", updatedNotification.platform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid condition value. Please select the valid status"
        );
      });
    });

    describe("Given the notification platform is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("sensorId", updatedNotification.sensorId)
          .field("name", updatedNotification.name)
          .field("message", updatedNotification.message)
          .field("threshold", updatedNotification.threshold)
          .field("condition", updatedNotification.condition)
          .field("platform", invalidPlatform)
          .field("address", updatedNotification.address);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid platform value. Please select the valid status"
        );
      });
    });
  });

  describe("Delete notification route", () => {
    describe("Given the admin delete notification created by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to delete other user notification"
        );
      });
    });

    describe("Given the normal user delete notification created by other user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to delete other user notification"
        );
      });
    });
    
    describe("Given the user is admin that created the notification", () => {
      it("should return a 200 and successful delete message", async () => {
        const res = await request(app)
          .delete(`/api/v1/notification/${testNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty(
          "msg",
          `Success delete notification ${testNotificationId}`
        );
      });
    });

    describe("Given the user is normal user that created the notification", () => {
      it("should return a 200 and successful delete message", async () => {
        const res = await request(app)
          .delete(`/api/v1/notification/${testNotificationId2}`)
          .set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty(
          "msg",
          `Success delete notification ${testNotificationId2}`
        );
      });
    });

    describe("Given the delete notification is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/notification/${nonExistNotificationId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No notification with id ${nonExistNotificationId}`
        );
      });
    });
  });
});
