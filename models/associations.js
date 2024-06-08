const UserSchema = require("./Users");
const BoardSchema = require("./Boards");
const SensorSchema = require("./Sensors");
const DashboardSchema = require("./Dashboards");
const NotificationSchema = require("./Notifications");
const SensorControlsSchema = require("./SensorControls");
const SensorDataSchema = require("./SensorData");

UserSchema.hasMany(BoardSchema, { foreignKey: "userId", as: "boards" });
BoardSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

BoardSchema.hasMany(SensorSchema, { foreignKey: "boardId", as: "sensors" });
SensorSchema.belongsTo(BoardSchema, { foreignKey: "boardId", as: "board" });

UserSchema.hasMany(DashboardSchema, { foreignKey: "userId", as: "dashboards" });
DashboardSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

UserSchema.hasMany(NotificationSchema, {
  foreignKey: "userId",
  as: "notifications",
});
NotificationSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

UserSchema.hasMany(SensorControlsSchema, {
  foreignKey: "userId",
  as: "sensorControls",
});
SensorControlsSchema.belongsTo(UserSchema, {
  foreignKey: "userId",
  as: "user",
});

SensorSchema.hasMany(SensorControlsSchema, {
  foreignKey: "sensorId",
  as: "sensorControls",
});
SensorControlsSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

SensorSchema.hasMany(SensorDataSchema, {
  foreignKey: "sensorId",
  as: "sensorData",
});
SensorDataSchema.belongsTo(SensorSchema, {
  foreignKey: "sensorId",
  as: "sensor",
});

module.exports = {
  UserSchema,
  BoardSchema,
  SensorSchema,
  DashboardSchema,
  NotificationSchema,
  SensorControlsSchema,
  SensorDataSchema,
};
