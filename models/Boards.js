// Import required Sequelize components
const { DataTypes, Sequelize } = require("sequelize");
// Database connection instance
const sequelize = require("../db/connect");

/**
 * Board Model Definition
 * 
 * Represents physical IoT boards in the system with network capabilities.
 * Includes validation for critical fields and automatic timestamp management.
 */
const BoardSchema = sequelize.define(
  "Boards",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,   // Auto-generated unique ID
      primaryKey: true,
      allowNull: false,
    },

    // Reference to owning user (foreign key to Users table)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Board display name with validation
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "Board name should be between 2 and 50 characters",
        },
      },
    },

    // Board type/category (e.g., "Raspberry Pi", "Arduino", "ESP32")
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "Board type should be between 2 and 50 characters",
        },
      },
    },

    // Physical location descriptor
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Board location should be between 2 and 100 characters",
        },
      },
    },

    // Network identifier with strict validation
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,   // Enforce unique IP addresses
      validate: {
        is: {
          // Regex pattern for valid IPv4 addresses
          args: [
            "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
          ],
          msg: "Please provide a valid IP address",
        },
      },
    },

    // Optional image URL for board representation
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",    // Empty string default instead of null
    },

    // Manual timestamp management
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,    // Set on creation
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,     // Set on creation 
    },
  },
  {
    // Model configuration
    timestamps: false,    // Disable automatic timestamps (using manual ones)
    freezeTableName: true,    // Prevent table name pluralization
    hooks: {
      // Auto-update timestamp before any update
      beforeUpdate: async (board) => {
        board.updatedAt = new Date();
      },
    },
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("Boards table created successfully");
  })
  .catch((error) => {
    console.log("Unable to create Boards table: ", error);
  });

module.exports = BoardSchema;
