const UserSchema = require("./Users");
const BoardSchema = require("./Boards");
const SensorSchema = require("./Sensors");

BoardSchema.belongsTo(UserSchema, { foreignKey: "userId" });
BoardSchema.hasMany(SensorSchema, { foreignKey: "boardId", as: "sensors" });

SensorSchema.belongsTo(BoardSchema, { foreignKey: "boardId", as: "board" });

module.exports = { UserSchema, BoardSchema, SensorSchema };
