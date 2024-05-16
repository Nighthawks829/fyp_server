const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Boards");
const Board = require("../models/Boards");
const Sensor = require("../models/Sensors");
const User = require("../models/Users");
const Notification = require("../models/Notifications");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const testAdminId = "testNotificationAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testNotificationAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testNotificationUserId";
const testUserName = "Test User";
const testUserEmail = "testNotificationUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const testBoardId = "testNotificationBoardId";
const testBoardName = "testBoardName";
const testBoardType = "testBoardType";
const testBoardLocation = "testBoardLocation";
const testBoardIpAddress = "4.4.4.4";
const testBoardImage = "testBoardImage";

const testSensorId = "testNotificationSensorId";
const testSensorName = "testSensorName";
const testSensorPin = "13";
const testSensorType = "Digital Input";
const testSensorTopic = "testNotificationTopic/";
const testSensorImage = "testSensorImage";

const testNotificationId = "testNotificationId";
const testNotificatioName = "tesrNotificationName";
const testNotificationMessage = "testNotificationMessage";
const testNotificationThreshold = 999;
const testNotificationCondition = "bigger";
const testNotificationPlatform = "email";
const testNotificationAddress = "notification@gmail.com";

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

  //   Create test notification
  await Notification.create({
    id: testNotificationId,
    userId: testAdminId,
    sensorId: testSensorId,
    name: testNotificatioName,
    message: testNotificationMessage,
    threshold: testNotificationThreshold,
    condition: testNotificationCondition,
    platform: testNotificationPlatform,
    address: testNotificationAddress,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;

  await sequelize.sync();
});

afterAll(async () => {
  await Notification.destroy({
    where: {
      id: testNotificationId,
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

describe("Notification API", () => {
  it("should get all notification", async () => {
    const res = await request(app)
      .get("/api/v1/notification")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("notifications");
    expect(res.body).toHaveProperty("count");
    expect(res.body.notifications[0]).toHaveProperty("id");
    expect(res.body.notifications[0]).toHaveProperty("userId");
    expect(res.body.notifications[0]).toHaveProperty("sensorId");
    expect(res.body.notifications[0]).toHaveProperty("name");
    expect(res.body.notifications[0]).toHaveProperty("message");
    expect(res.body.notifications[0]).toHaveProperty("threshold");
    expect(res.body.notifications[0]).toHaveProperty("condition");
    expect(res.body.notifications[0]).toHaveProperty("platform");
    expect(res.body.notifications[0]).toHaveProperty("address");
  });

  it("should get a notification", async () => {
    const res = await request(app)
      .get(`/api/v1/notification/${testNotificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("notification");
    expect(res.body.notification).toHaveProperty("userId", testAdminId);
    expect(res.body.notification).toHaveProperty("sensorId", testSensorId);
    expect(res.body.notification).toHaveProperty("name", testNotificatioName);
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
  });

  it("shold throw an error if notification not found when get notification", async () => {
    const nonExistNotificationId = "nonExistNotificationId";

    const res = await request(app)
      .get(`/api/v1/notification/${nonExistNotificationId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No notification with id ${nonExistNotificationId}`
    );
  });

  it("should add a new notification", async () => {
    // New test notification configuration
    const newNotification = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Notification",
      message: "Test Message",
      threshold: 999,
      condition: "lower",
      platform: "telegram",
      address: "testTelegramBotId",
    };

    const res = await request(app)
      .post("/api/v1/notification")
      .set("Authorization", `Bearer ${token}`)
      .send(newNotification);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("notification");
    expect(res.body.notification).toHaveProperty(
      "notificationId",
      res.body.notification.notificationId
    );
    expect(res.body.notification).toHaveProperty(
      "userId",
      newNotification.userId
    );
    expect(res.body.notification).toHaveProperty(
      "sensorId",
      newNotification.sensorId
    );
    expect(res.body.notification).toHaveProperty("name", newNotification.name);
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

    await Notification.destroy({
      where: {
        id: res.body.notification.notificationId,
      },
    });
  });

  it("should update a notification", async () => {
    // Update notification configuration
    const updatedNotification = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Update Notification",
      message: "Test Update Message",
      threshold: 999,
      condition: "bigger",
      platform: "email",
      address: "example@gmail.com",
    };

    const res = await request(app)
      .patch(`/api/v1/notification/${testNotificationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNotification);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("notification");
    expect(res.body.notification).toHaveProperty(
      "notificationId",
      testNotificationId
    );
    expect(res.body.notification).toHaveProperty(
      "userId",
      updatedNotification.userId
    );
    expect(res.body.notification).toHaveProperty(
      "sensorId",
      updatedNotification.sensorId
    );
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
  });

  it("should throw an error if not all values are provided when updated notification", async () => {
    const incompleteNotification = {
      userId: testAdminId,
      sensorId: testSensorId,
      // name is missing
      message: "Test Message",
      threshold: 999,
      condition: "lower",
      platform: "telegram",
      address: "testTelegramBotId",
    };

    const res = await request(app)
      .patch(`/api/v1/notification/${testNotificationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteNotification);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide all values");
  });

  it("should throw an error when user delete other user notification", async () => {
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
      .delete(`/api/v1/notification/${testNotificationId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty(
      "msg",
      "No allow to delete other user notification"
    );
  });

  it("should delete a notification", async () => {
    const res = await request(app)
      .delete(`/api/v1/notification/${testNotificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      `Success delete notification ${testNotificationId}`
    );

    // Verify notification is deleted
    const notification = await Notification.findByPk(testNotificationId);
    expect(notification).toBeNull();
  });

  it("should throw an error if notification not found when delete notification", async () => {
    const nonExistNotificationId = "nonExistNotificationId";

    const res = await request(app)
      .delete(`/api/v1/notification/${nonExistNotificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No notification with id ${nonExistNotificationId}`
    );
  });

  it("should throw an error user update other user notification", async () => {
    // Update notification configuration
    const updatedNotification = {
      userId: testAdminId,
      sensorId: testSensorId,
      name: "Test Update Notification",
      message: "Test Update Message",
      threshold: 999,
      condition: "bigger",
      platform: "email",
      address: "example@gmail.com",
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
