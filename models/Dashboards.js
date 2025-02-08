// Import required Sequelize components
const { DataTypes, Sequelize } = require("sequelize");
// Database connection instance
const sequelize = require("../db/connect");

/**
 * Dashboard Component Model
 * 
 * Manages user-created dashboard components for visualizing and interacting with sensor data.
 * Tracks user customization preferences and component configurations.
 */
const DashboardSchema = sequelize.define(
  "Dashboards",
  {
    // Unique identifier using UUIDv4
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Reference to owning user (foreign key to Users table)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Reference to associated sensor (foreign key to Sensors table)
    sensorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Component display name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Dashboard component name should be between 2 and 100 characters",
        },
      },
    },

    // Control capability flag
    control: {
      type: DataTypes.BOOLEAN,
      allowNull: false,   // True = interactive component, False = read-only
    },

    // Component type classification
    type: {
      type: DataTypes.ENUM,
      values: [
        "widget",   // Simple data display component
        "graph"     // Time-series visualization component
      ],
      allowNull: false,
    },

    // Creation timestamp
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // Last update timestamp
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    // Model configuration
    timestamps: false,    // Disable automatic timestamps (using manual ones)
    freezeTableName: true,    // Prevent table name pluralization
  }
);

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("Dashboards table created successfully");
  })
  .catch((error) => {
    console.log("Unable to created Dashboards table: ", error);
  });

module.exports = DashboardSchema;
