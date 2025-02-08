require("dotenv").config();
const createServer = require("./utils/server");

const sequelize = require("./db/connect");
const port = process.env.PORT || 5000;

const app = createServer();

app.listen(port, async () => {
  try {
    await sequelize
      .authenticate()
      .then(() => console.log("Connection has been establidhes"));
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
