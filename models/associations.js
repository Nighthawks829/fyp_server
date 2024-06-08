const UserSchema = require("./Users");
const BoardSchema = require("./Boards");
const SensorSchema = require("./Sensors");
const DashboardSchema = require("./Dashboards");
const NotificationSchema = require("./Notifications");
const SensorControlsSchema = require("./SensorControls");

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

module.exports = {
  UserSchema,
  BoardSchema,
  SensorSchema,
  DashboardSchema,
  NotificationSchema,
  SensorControlsSchema,
};
