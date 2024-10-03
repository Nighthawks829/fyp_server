const { NotificationSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

const Notification = NotificationSchema;

const getAllNotifications = async (req, res) => {
  const userId = req.user.userId;
  const notifications = await Notification.findAll({
    where: { userId: userId },
    include: {
      model: SensorSchema,
      as: "sensor",
      attributes: ["name"]
    }
  });

  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    userId: notification.userId,
    sensorId: notification.sensorId,
    name: notification.name,
    threshold: notification.threshold,
    condition: notification.condition,
    message: notification.message,
    platform: notification.platform,
    address: notification.address,
    sensorName: notification.sensor.name
  }));

  res.status(StatusCodes.OK).json({
    notifications: formattedNotifications,
    count: notifications.length
  });
};

const getNotification = async (req, res) => {
  const notification = await Notification.findByPk(req.params.id, {
    include: {
      model: SensorSchema,
      as: "sensor",
      attributes: ["name"]
    }
  });

  if (notification) {
    if (notification.userId !== req.user.userId) {
      throw new ForbiddenError("No allow to get other user notifications");
    } else {
      res.status(StatusCodes.OK).json({
        notification: {
          notificationId: notification.id,
          userId: notification.userId,
          sensorId: notification.sensorId,
          name: notification.name,
          threshold: notification.threshold,
          condition: notification.condition,
          message: notification.message,
          platform: notification.platform,
          address: notification.address,
          sensorName: notification.sensor.name
        }
      });
    }
  } else {
    throw new NotFoundError(`No notification with id ${req.params.id}`);
  }
};

const addNotification = async (req, res) => {
  const { sensorId, name, threshold, condition, message, platform, address } =
    req.body;

  const userId = req.user.userId;

  const notification = await Notification.create({
    userId: userId,
    sensorId: sensorId,
    name: name,
    threshold: threshold,
    condition: condition,
    message: message,
    platform: platform,
    address: address
  });

  if (notification) {
    res.status(StatusCodes.CREATED).json({
      notification: {
        notificationId: notification.id,
        userId: notification.userId,
        sensorId: notification.sensorId,
        name: notification.name,
        threshold: notification.threshold,
        condition: notification.condition,
        message: notification.message,
        platform: notification.platform,
        address: notification.address
      }
    });
  } else {
    throw new BadRequestError(
      "Unable to create new notification. Try again later"
    );
  }
};

const updateNotification = async (req, res) => {
  const {
    body: { sensorId, name, threshold, condition, message, platform, address },
    params: { id: notificationId }
  } = req;

  const userId = req.user.userId;

  if (
    !userId ||
    !sensorId ||
    !name ||
    !threshold ||
    !condition ||
    !message ||
    !platform ||
    !address
  ) {
    throw new BadRequestError("Please provide all values");
  }

  const notification = await Notification.findByPk(notificationId);

  if (notification) {
    if (notification.userId !== userId) {
      throw new ForbiddenError("No allow to update other user notification");
    }
    // notification.userId = userId;
    notification.sensorId = sensorId;
    notification.name = name;
    notification.threshold = threshold;
    notification.condition = condition;
    notification.message = message;
    notification.platform = platform;
    notification.address = address;

    await notification.save();

    res.status(StatusCodes.OK).json({
      notification: {
        notificationId: notificationId,
        userId: userId,
        sensorId: notification.sensorId,
        name: notification.name,
        threshold: notification.threshold,
        condition: notification.condition,
        message: notification.message,
        platform: notification.platform,
        address: notification.address
      }
    });
  } else {
    throw new NotFoundError(`No notification with id ${req.params.id}`);
  }
};

const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;

  const notificationUserId = await Notification.findByPk(notificationId);

  if (!notificationUserId) {
    throw new NotFoundError(`No notification with id ${notificationId}`);
  }

  if (notificationUserId.userId !== req.user.userId) {
    throw new ForbiddenError("No allow to delete other user notification");
  }

  const notification = await Notification.destroy({
    where: {
      id: notificationId
    }
  });

  if (!notification) {
    throw new NotFoundError(`No notification with id ${notificationId}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: `Success delete notification ${notificationId}` });
};

module.exports = {
  getAllNotifications,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification
};
