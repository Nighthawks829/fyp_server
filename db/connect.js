// Import Sequelize ORM and dotenv for environment variables
const { Sequelize } = require("sequelize");
require("dotenv").config();

/**
 * Database Connection Configuration
 * 
 * Creates a Sequelize instance to connect to a MySQL database using environment variables
 * for secure credential management. Configuration includes timezone settings and
 * date handling options.
 */
const sequelize = new Sequelize(
  // Database name from environment variables
  process.env.DATABASE_NAME,
  // Database username from environment variables  
  process.env.DATABASE_USERNAME,
  // Database password from environment variables
  process.env.DATABASE_PASSWORD,
  {
    // Database host address from environment variables
    host: process.env.DATABASE_HOST,

    // Specify MySQL dialect
    dialect: "mysql",

    // Disables SQL query logging in console (useful for production)
    logging: false,

    // MySQL-specific dialect options
    dialectOptions: {
      // Return dates as strings instead of JS Date objects
      dateStrings: true,

      // Enable type casting for proper data type conversion
      typeCast: true
    },

    // Set timezone for database connection (UTC+8 in this case)
    timezone: "+08:00",
  }
);

// Export the configured Sequelize instance for use in other modules
module.exports = sequelize;
