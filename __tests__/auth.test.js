const request = require("supertest");
const sequelize = require("../db/connect");
const User = require("../models/Users");
const app = require("../app");

const testAdminId = "testLoginAdminId";
const testAdminName = "Test Login Admin";
const testAdminEmail = "testLoginAdmin@example.com";
const testAdminPassword = "password";
const testAdminImage = "loginAdminImage";
const testAdminRole = "admin";

describe("Auth API", () => {
  beforeAll(async () => {
    // Create test login admin before running tests
    const createUser = await User.create({
      id: testAdminId,
      name: testAdminName,
      email: testAdminEmail,
      password: testAdminPassword,
      role: testAdminRole,
      image: testAdminImage
    });

    // Sync the database before running tests
    await sequelize.sync();
  });

  afterAll(async () => {
    // Delete test login admin after running tests
    await User.destroy({
      where: {
        id: testAdminId
      }
    });

    // Close the database connection after running tests
    await sequelize.close();
  });

  describe("Login Route", () => {
    describe("Given the username and password are valid", () => {
      it("should return user payload and JWT token", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
          email: testAdminEmail,
          password: testAdminPassword
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
        expect(res.body).toHaveProperty("token");
      });
    });

    describe("Given the username are invalid", () => {
      it("should return a 401 and invalid email address message", async () => {
        const res = await request(app)
          .post("/api/v1/auth/login") // Use your actual login endpoint
          .send({
            email: "invalid@gmail.com",
            password: testAdminPassword
          });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Invalid Email Address");
      });
    });

    describe("Given the password are invalid", () => {
      it("should return a 401 and invalid password message", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
          email: testAdminEmail,
          password: "invalidPassword"
        });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Invalid Password");
      });
    });

    describe("Given the email address field is missing", () => {
      it("should return a 400 and validation error message", async () => {
        res = await request(app)
          .post("/api/v1/auth/login")
          .send({ password: testAdminPassword });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Please provide email and password"
        );
      });
    });

    describe("Given the password field is missing", () => {
      it("should return a 400 and validation error message", async () => {
        res = await request(app)
          .post("/api/v1/auth/login")
          .send({ email: testAdminEmail });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Please provide email and password"
        );
      });
    });
  });

  describe("Logout Route", () => {
    describe("Given the user are already login as a user", () => {
      it("should return a 200 and succeessful logout message", async () => {
        const res = await request(app).post("/api/v1/auth/logout");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message", "Logged out successfully");
      });
    });
  });
});
