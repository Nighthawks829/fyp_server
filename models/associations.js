const UserSchema = require("./Users");
const BoardSchema = require("./Boards");
const SensorSchema = require("./Sensors");

UserSchema.hasMany(BoardSchema, { foreignKey: "userId", as: "boards" });
BoardSchema.belongsTo(UserSchema, { foreignKey: "userId", as: "user" });

BoardSchema.hasMany(SensorSchema, { foreignKey: "boardId", as: "sensors" });
SensorSchema.belongsTo(BoardSchema, { foreignKey: "boardId", as: "board" });

module.exports = { UserSchema, BoardSchema, SensorSchema };
