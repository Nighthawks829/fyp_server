const UserSchema = require("./Users");
const BoardSchema = require("./Boards");
const SensorSchema = require("./Sensors");
const DashboardSchema = require("./Dashboards");
const NotificationSchema = require("./Notifications");
const SensorControlsSchema = require("./SensorControls");
const SensorDataSchema = require("./SensorData");

/***************************
 * User Relationships
 ***************************/
// A User can have multiple Boards (1:M)
UserSchema.hasMany(BoardSchema, { foreignKey: "userId", as: "boards" });
// Each Board belongs to a single User (M:1)
BoardSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

// A User can have multiple Dashboards (1:M)
UserSchema.hasMany(DashboardSchema, { foreignKey: "userId", as: "dashboards" });
DashboardSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

// A User can have multiple Notifications (1:M)
UserSchema.hasMany(NotificationSchema, {
  foreignKey: "userId",
  as: "notifications",
});
NotificationSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

// A User can have multiple Sensor Controls (1:M)
UserSchema.hasMany(SensorControlsSchema, {
  foreignKey: "userId",
  as: "sensorControls",
});
SensorControlsSchema.belongsTo(UserSchema, {
  foreignKey: "userId",
  as: "user",
});

/***************************
 * Board Relationships
 ***************************/
// A Board can have multiple Sensors (1:M)
BoardSchema.hasMany(SensorSchema, { foreignKey: "boardId", as: "sensors" });
SensorSchema.belongsTo(BoardSchema, { foreignKey: "boardId", as: "board" });

/***************************
 * Sensor Relationships
 ***************************/
// A Sensor can have multiple Data entries (1:M)
SensorSchema.hasMany(SensorDataSchema, {
  foreignKey: "sensorId",
  as: "sensorData",
});
SensorDataSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

// A Sensor can be part of multiple Dashboards (1:M)
SensorSchema.hasMany(DashboardSchema, {
  foreignKey: "sensorId",
  as: "dashboards",
});
DashboardSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

// A Sensor can have multiple Notifications (1:M)
SensorSchema.hasMany(NotificationSchema, {
  foreignKey: "sensorId",
  as: "notifications",
});
NotificationSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

// A Sensor can have multiple Control entries (1:M)
SensorSchema.hasMany(SensorControlsSchema, {
  foreignKey: "sensorId",
  as: "sensorControls",
});
SensorControlsSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

/***************************
 * Export All Models
 ***************************/
module.exports = {
  UserSchema,
  BoardSchema,
  SensorSchema,
  DashboardSchema,
  NotificationSchema,
  SensorControlsSchema,
  SensorDataSchema,
};
