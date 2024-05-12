const request = require("supertest");
const app = require("../app"); // Import your Express app
const { sequelize } = require("../models/Users"); // Import your sequelize instance

beforeAll(async () => {
  // Sync the database before running tests
  await sequelize.sync();
});

afterAll(async () => {
  // Close the database connection after running tests
  await sequelize.close();
});

describe("Auth API", () => {
  const testEmail = "sam0230@gmail.com";
  const testPassword = "12345";
  it("should login a user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
  });

  it("should logout a user", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Logged out successfully");
  });

  it("should require email and password to login", async () => {
    // Test with no email and password
    let res = await request(app)
      .post("/api/v1/auth/login") // Use your actual login endpoint
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide email and password");

    // Test with no password
    res = await request(app)
      .post("/api/v1/auth/login") // Use your actual login endpoint
      .send({ email: testEmail });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide email and password");

    // Test with no email
    res = await request(app)
      .post("/api/v1/auth/login") // Use your actual login endpoint
      .send({ password: testPassword });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide email and password");
  });

  it("should reject incorrect password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login") // Use your actual login endpoint
      .send({
        email: testEmail,
        password: "wrongPassword",
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Invalid Password");
  });

  it("should reject invalid email address", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login") // Use your actual login endpoint
      .send({
        email: 'invalid@gmail.com',
        password: testPassword
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Invalid Email Address");
  });

});
