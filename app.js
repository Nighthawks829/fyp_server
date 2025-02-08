require("dotenv").config();
const createServer = require("./utils/server");

const sequelize = require("./db/connect");

// Define the port number from environment variables, defaulting to 5000 if not set
const port = process.env.PORT || 5000;

const app = createServer();

// Start the server and establish a database connection
app.listen(port, async () => {
  try {
    // Attempt to authenticate the database connection
    await sequelize
      .authenticate()
      .then(() => console.log("Connection has been establidhes"));
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
