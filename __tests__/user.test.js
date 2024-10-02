const request = require("supertest");
const sequelize = require("../db/connect");
const User = require("../models/Users");
const path = require("path");
const app = require("../app");

const testAdminId = "testUserAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testBoardAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testUserUserId";
const testUserName = "Test User";
const testUserEmail = "testBoardUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

const fixedUserId = "testFixedUserId";
const fixedUserName = "Fixed User";
const fixedUserEmail = "testFixedUser@gmail.com";
const fixedUserPassword = "password";
const fixedUserImage = "userImage";
const fixedUserRole = "user";

const nonExistUserId = "nonExistUserId";

// New test user credentials
const newUser = {
  name: "Test User",
  email: "testAdduser@gmail.com",
  password: "password",
  role: "user",
  image: "testimage.jpg"
};

const newUserImage = "testBoardImage.jpeg";
const newUserImagePath = path.join(__dirname, "assets", newUserImage);

const invalidImage = "empty.mp3";
const testInvalidImagePath = path.join(__dirname, "assets", invalidImage);

const shortUserName = "a";
const longUserName =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const invalidUserEmail = "invalidUserEmail";

const shortUserPassword = "a";
const longUserPassword =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const invalidUserRole = "invalidUserRole";

const updatedUser = {
  name: "Updated Test User",
  email: "updatedtestuser@gmail.com",
  password: "updatedtestpassword",
  role: "admin",
  image: "updatedtestimage.jpg"
};

const updatedUser2 = {
  name: "Updated Test User",
  email: "updatedtestuser2@gmail.com",
  password: "updatedtestpassword",
  role: "admin",
  image: "updatedtestimage.jpg"
};

const updatedUser3 = {
  name: "Updated Test User",
  email: "updatedtestuser3@gmail.com",
  password: "updatedtestpassword",
  role: "admin",
  image: "updatedtestimage.jpg"
};

const updateUserImage = "testBoardImage2.jpeg";
const testUpdateImagePath = path.join(__dirname, "assets", updateUserImage);
const updateUserInvalidImage = "empty.mp3";
const testUpdatetInvalidImagePath = path.join(
  __dirname,
  "assets",
  updateUserInvalidImage
);

let adminToken = "";
let userToken = "";

describe("User API", () => {
  beforeAll(async () => {
    // Create test admin
    await User.create({
      id: testAdminId,
      name: testAdminName,
      email: testAdminEmail,
      password: testAdminPassword,
      role: testAdminRole,
      image: testAdminImage
    });

    // Create test user
    await User.create({
      id: testUserId,
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword,
      role: testUserRole,
      image: testUserImage
    });

    // Create fixed user
    await User.create({
      id: fixedUserId,
      name: fixedUserName,
      email: fixedUserEmail,
      password: fixedUserPassword,
      role: fixedUserRole,
      image: fixedUserImage
    });

    // Sign in admin and get admin token
    const adminResponse = await request(app).post("/api/v1/auth/login").send({
      email: testAdminEmail,
      password: testAdminPassword
    });

    adminToken = adminResponse.body.token;

    // Sign in as user and get user token
    const userResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserEmail,
      password: testUserPassword
    });

    userToken = userResponse.body.token;

    // Sync the database before running test
    await sequelize.sync();
  });

  afterAll(async () => {
    await User.destroy({
      where: {
        id: testAdminId
      }
    });

    await User.destroy({
      where: {
        id: testUserId
      }
    });

    await User.destroy({
      where: {
        id: fixedUserId
      }
    });

    await sequelize.close();
  });

  describe("Get all users route", () => {
    describe("Given the users exist and user is admin", () => {
      it("should return a 200 and list of uers and list length", async () => {
        const res = await request(app)
          .get("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);

        expect(res.body).toHaveProperty("users");
        expect(res.body).toHaveProperty("count");
        expect(res.body.users[0]).toHaveProperty("id");
        expect(res.body.users[0]).toHaveProperty("name");
        expect(res.body.users[0]).toHaveProperty("email");
        expect(res.body.users[0]).toHaveProperty("role");
        expect(res.body.users[0]).toHaveProperty("image");
      });
    });

    describe("Given the users exist and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .get("/api/v1/user")
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });
  });

  describe("Get user with id route", () => {
    describe("Given the user exist and user is admin", () => {
      it("should return a 200 and user payload", async () => {
        const res = await request(app)
          .get(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty("userId");
        expect(res.body.user).toHaveProperty("name");
        expect(res.body.user).toHaveProperty("email");
        expect(res.body.user).toHaveProperty("role");
        expect(res.body.user).toHaveProperty("image");
      });
    });

    describe("Given the user exist and user is normal user", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .get(`/api/v1/user/${testAdminId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to get other user profile"
        );
      });
    });

    describe("Given the admin get own profile", () => {
      it("should return a 200 and user payload", async () => {
        const res = await request(app)
          .get(`/api/v1/user/${testAdminId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty("userId");
        expect(res.body.user).toHaveProperty("name");
        expect(res.body.user).toHaveProperty("email");
        expect(res.body.user).toHaveProperty("role");
        expect(res.body.user).toHaveProperty("image");
      });
    });

    describe("Given the normal user get own profile", () => {
      it("should return a 200 and user payload", async () => {
        const res = await request(app)
          .get(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty("userId");
        expect(res.body.user).toHaveProperty("name");
        expect(res.body.user).toHaveProperty("email");
        expect(res.body.user).toHaveProperty("role");
        expect(res.body.user).toHaveProperty("image");
      });
    });

    describe("Given the user is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .get(`/api/v1/user/${nonExistUserId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No user with id ${nonExistUserId}`
        );
      });
    });
  });

  describe("Add user route", () => {
    describe("Given the user payliad is valid and user is admin", () => {
      it("should return a 201 and user payload", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(201);
        expect(res.body.user).toHaveProperty("userId", res.body.user.userId);
        expect(res.body.user).toHaveProperty("name", newUser.name);
        expect(res.body.user).toHaveProperty("email", newUser.email);
        expect(res.body.user).toHaveProperty("role", newUser.role);
        expect(res.body.user).toHaveProperty("image", newUserImage);

        await User.destroy({
          where: {
            id: res.body.user.userId
          }
        });
      });
    });

    describe("Given the user payload is valid and user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${userToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the user name shorter 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", shortUserName)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "User name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the user name longer than 50 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", longUserName)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "User name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the user email is not unique", () => {
      it("should return a 400 and not unqiue error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", fixedUserEmail)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Email address must be unique");
      });
    });

    describe("Given the user email is not valid", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", invalidUserEmail)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide a valid email");
      });
    });

    describe("Given the user password shorter than 2 characters", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", shortUserPassword)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Password length should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the user password longer than 100 characters", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", longUserPassword)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Password length should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the user role is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", invalidUserRole)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid role value. Please select the valid status"
        );
      });
    });

    describe("Given the user image is invalid", () => {
      it("shold return a 400 and invalud image type message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", testInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Users name cannot be null");
      });
    });

    describe("Given the email field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("password", newUser.password)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Users email cannot be null");
      });
    });

    describe("Given the password field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("role", newUser.role)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Users password cannot be null");
      });
    });

    describe("Given the role field is missing", () => {
      it("should return a 201 and user payload with normal user role", async () => {
        const res = await request(app)
          .post("/api/v1/user")
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", newUser.name)
          .field("email", newUser.email)
          .field("password", newUser.password)
          .attach("image", newUserImagePath);

        expect(res.statusCode).toEqual(201);

        const user = await User.findByPk(res.body.user.userId);
        expect(user.role).toEqual("user");

        await User.destroy({
          where: {
            id: res.body.user.userId
          }
        });
      });
    });
  });

  describe("Update user route", () => {
    describe("Given the admin update other user with valid payload", () => {
      it("should return a 200 and user payload", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty("userId", res.body.user.userId);
        expect(res.body.user).toHaveProperty("name", updatedUser.name);
        expect(res.body.user).toHaveProperty("email", updatedUser.email);
        expect(res.body.user).toHaveProperty("role", updatedUser.role);
        expect(res.body.user).toHaveProperty("image", updateUserImage);
      });
    });

    describe("Given the normal user update other user with valid payload", () => {
      it("should return a 403 and authentication invalid error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testAdminId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty(
          "msg",
          "No allow to edit other user profile"
        );
      });
    });

    describe("Given the admin update own profile with valid payload", () => {
      it("should return a 200 and user payload and new JWT token", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testAdminId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser2.name)
          .field("email", updatedUser2.email)
          .field("password", updatedUser2.password)
          .field("role", updatedUser2.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("userId", res.body.user.userId);
        expect(res.body.user).toHaveProperty("name", updatedUser2.name);
        expect(res.body.user).toHaveProperty("email", updatedUser2.email);
        expect(res.body.user).toHaveProperty("role", updatedUser2.role);
        expect(res.body.user).toHaveProperty("image", updateUserImage);
      });
    });

    describe("Given the normal user update own profile with valid payload", () => {
      it("should return a 200 and user payload and new JWT token", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .field("name", updatedUser3.name)
          .field("email", updatedUser3.email)
          .field("password", updatedUser3.password)
          .field("role", updatedUser3.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("userId", res.body.user.userId);
        expect(res.body.user).toHaveProperty("name", updatedUser3.name);
        expect(res.body.user).toHaveProperty("email", updatedUser3.email);
        expect(res.body.user).toHaveProperty("role", updatedUser3.role);
        expect(res.body.user).toHaveProperty("image", updateUserImage);
      });
    });

    describe("Given the update user is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${nonExistUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No user with id ${nonExistUserId}`
        );
      });
    });

    describe("Given the user name shorter 2 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", shortUserName)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "User name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the user name longer than 50 characters", () => {
      it("should return a 400 and validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", longUserName)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "User name should be between 2 and 50 characters"
        );
      });
    });

    describe("Given the user email is not unique", () => {
      it("should return a 400 and not unqiue error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", fixedUserEmail)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Email address must be unique");
      });
    });

    describe("Given the user email is not valid", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", invalidUserEmail)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide a valid email");
      });
    });

    describe("Given the user password shorter than 2 characters", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", shortUserPassword)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Password length should be between 2 and 100 characters"
        );
      });
    });
    describe("Given the user password longer than 100 characters", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", longUserPassword)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Password length should be between 2 and 100 characters"
        );
      });
    });

    describe("Given the user role is not in the enum list", () => {
      it("should return a 400 and database validation error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", invalidUserRole)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid role value. Please select the valid status"
        );
      });
    });

    describe("Given the user image is invalid", () => {
      it("shold return a 400 and invalud image type message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testInvalidImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty(
          "msg",
          "Invalid file type. Only image files are allowed"
        );
      });
    });

    describe("Given the name field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the email field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("password", updatedUser.password)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the password field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("role", updatedUser.role)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });

    describe("Given the role field is missing", () => {
      it("should return a 400 and null error message", async () => {
        const res = await request(app)
          .patch(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .field("name", updatedUser.name)
          .field("email", updatedUser.email)
          .field("password", updatedUser.password)
          .attach("image", testUpdateImagePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("msg", "Please provide all values");
      });
    });
  });

  describe("Delete user route", () => {
    describe("Given the user is admin", () => {
      it("should return a 200 and successful delete message", async () => {
        const res = await request(app)
          .delete(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty(
          "msg",
          `Success delete user ${testUserId}`
        );

        // Verify board is deleted
        const user = await User.findByPk(testUserId);
        expect(user).toBeNull();
      });
    });

    describe("Given the user is normal user", () => {
      it("should return a 401 and authentication invalid error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/user/${testUserId}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("msg", "Authentication Invalid");
      });
    });

    describe("Given the delete user is not found", () => {
      it("should return a 404 and not found error message", async () => {
        const res = await request(app)
          .delete(`/api/v1/user/${nonExistUserId}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          "msg",
          `No user with id ${nonExistUserId}`
        );
      });
    });
  });
});
