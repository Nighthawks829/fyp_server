const { NotificationSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

const Notification = NotificationSchema;


/**
 * Get All Notifications
 * 
 * Retrieves all notifications for the authenticated user
 * Includes associated sensor names in response
 * Formats response with unified notification-sensor data
 */
const getAllNotifications = async (req, res) => {
  const userId = req.user.userId;

  // Fetch notifications with sensor relationships
  const notifications = await Notification.findAll({
    where: { userId: userId },
    include: {
      model: SensorSchema,
      as: "sensor",
      attributes: ["name"]    // Only include sensor name
    }
  });

  // Format response with combined notification-sensor data
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
    sensorName: notification.sensor.name    // Combine with sensor data
  }));

  res.status(StatusCodes.OK).json({
    notifications: formattedNotifications,
    count: notifications.length
  });
};

/**
 * Get Single Notification
 * 
 * Retrieves specific notification by ID
 * Verifies user ownership before returning
 * Includes associated sensor name in response
 */
const getNotification = async (req, res) => {
  const notification = await Notification.findByPk(req.params.id, {
    include: {
      model: SensorSchema,
      as: "sensor",
      attributes: ["name"]
    }
  });

  // Ownership verification
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

/**
 * Create New Notification
 * 
 * Creates alert notification rule with:
 * - Threshold value
 * - Condition operator
 * - Message template
 * - Delivery platform details
 */

const addNotification = async (req, res) => {
  const { sensorId, name, threshold, condition, message, platform, address } =
    req.body;

  const userId = req.user.userId;

  // Create notification record
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

/**
 * Update Notification
 * 
 * Full update of notification rule
 * Requires all fields to be provided
 * Strict ownership verification
 */
const updateNotification = async (req, res) => {
  const {
    body: { sensorId, name, threshold, condition, message, platform, address },
    params: { id: notificationId }
  } = req;

  const userId = req.user.userId;

  // Strict validation of all fields
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
    // Authorization check
    if (notification.userId !== userId) {
      throw new ForbiddenError("No allow to update other user notification");
    }

    // Update all notification properties
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

/**
 * Delete Notification
 * 
 * Removes notification rule after verifying:
 * - Notification existence
 * - User ownership
 * Two-step verification for security
 */
const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;

  // First check notification exists and get owner
  const notificationUserId = await Notification.findByPk(notificationId);
  if (notificationUserId) {
    // Verify ownership
    if (notificationUserId.userId !== req.user.userId) {
      throw new ForbiddenError("No allow to delete other user notification");
    }

    // Perform deletion
    const notification = await Notification.destroy({
      where: {
        id: notificationId
      }
    });

    res
      .status(StatusCodes.OK)
      .json({ msg: `Success delete notification ${notificationId}` });
  } else {
    throw new NotFoundError(`No notification with id ${notificationId}`);
  }
};

module.exports = {
  getAllNotifications,
  getNotification,
  addNotification,
  updateNotification,
  deleteNotification
};
