// Import required modules and dependencies
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/connect");   // Database connection instance
const bcrypt = require("bcrypt");             // Password hashing library
const jwt = require("jsonwebtoken");          // JSON Web Token implementation
require("dotenv").config();                   // Load environment variables

/**
 * User Model Definition
 * 
 * Represents application users with authentication capabilities and role-based access control.
 * Includes password hashing and JWT generation functionality.
 */
const UserSchema = sequelize.define(
  "Users",
  {
    // Unique identifier using UUID
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,   // Auto-generate UUIDv4
      primaryKey: true,
      allowNull: false,
    },

    // User's full name with validation
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: "User name should be between 2 and 50 characters",
        },
      },
    },

    // Unique email address with validation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "Please provide a valid email",
        },
      },
    },

    // Securely stored password with hashing
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Password length should be between 2 and 100 characters",
        },
      },
    },

    // Role-based access control (RBAC)
    role: {
      type: DataTypes.ENUM,
      values: ["admin", "user"],
      allowNull: false,
      defaultValue: "user",
    },

    // Optional profile image URL
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },

    // Automatic timestamps (manual implementation)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updateAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    // Model configuration
    timestamps: false,       // Disable automatic timestamps (using manual ones)
    freezeTableName: true,   // Prevent pluralization of table name
    hooks: {
      // Password hashing before creation
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      // Password hashing on update (if changed)
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
          user.updateAt = new Date();
        }
      },
    },
  }
);

/**
 * Instance Methods
 */

// Validate password against hashed version
UserSchema.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token for authentication
UserSchema.prototype.generateJWT = function () {
  return jwt.sign(
    { userId: this.id, name: this.name, email: this.email, role: this.role },
    process.env.JWT_SECRET,   // Secret key from environment
    {
      expiresIn: process.env.JWT_LIFETIME,    // Token expiration
    }
  );
};

// Synchronize model with database
sequelize
  .sync()
  .then(() => {
    console.log("Users table created successfully");
  })
  .catch((error) => {
    console.log("Unable to create Users table: ", error);
  });

module.exports = UserSchema;
