const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models/Users"); // Import your sequelize instance
const User = require("../models/Users");
const jwt = require("jsonwebtoken");

let token;
// const testEmail = "nighthawks12345@gmail.com";
// const testPassword = "12345";
// const testUserId = "666c9246-3d29-4d9f-b0dc-d141a781cb83";

const testAdminId = "testAdminId";
const testAdminName = "Test Admin";
const testAdminEmail = "testAdmin@gmail.com";
const testAdminPassword = "password";
const testAdminImage = "adminImage";
const testAdminRole = "admin";

const testUserId = "testUserId";
const testUserName = "Test User";
const testUserEmail = "testUser@gmail.com";
const testUserPassword = "password";
const testUserImage = "userImage";
const testUserRole = "user";

beforeAll(async () => {
  // Create test admin
  await User.create({
    id: testAdminId,
    name: testAdminName,
    email: testAdminEmail,
    password: testAdminPassword,
    role: testAdminRole,
    image: testAdminImage,
  });

  // Create test user 1
  await User.create({
    id: testUserId,
    name: testUserName,
    email: testUserEmail,
    password: testUserPassword,
    role: testUserRole,
    image: testUserImage,
  });

  const response = await request(app).post("/api/v1/auth/login").send({
    email: testAdminEmail,
    password: testAdminPassword,
  });

  token = response.body.token;
  await sequelize.sync();
});

afterAll(async () => {
  await User.destroy({
    where: {
      id: testAdminId,
    },
  });
  await User.destroy({
    where: {
      id: testUserId,
    },
  });
  await sequelize.close();
});

describe("User API", () => {
  it("should get all users", async () => {
    const res = await request(app)
      .get("/api/v1/user") // Use your actual getAllUsers endpoint
      .set("Authorization", `Bearer ${token}`); // Use the token obtained from login test
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("count");
    expect(res.body.users[0]).toHaveProperty("id");
    expect(res.body.users[0]).toHaveProperty("name");
    expect(res.body.users[0]).toHaveProperty("email");
    expect(res.body.users[0]).toHaveProperty("role");
    expect(res.body.users[0]).toHaveProperty("image");
  });
  it("should get a user", async () => {
    const res = await request(app)
      .get(`/api/v1/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("email");
    expect(res.body).toHaveProperty("role");
    expect(res.body).toHaveProperty("image");
  });
  it("should throw an error if user not found", async () => {
    const nonExistentUserId = "nonExistentUserId";

    const res = await request(app)
      .get(`/api/v1/user/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No user with id ${nonExistentUserId}`
    );
  });
  it("should add a new user", async () => {
    // New test user credentials
    const newUser = {
      name: "Test User",
      email: "testAdduser@gmail.com",
      password: "password",
      role: "user",
      image: "testimage.jpg",
    };

    const res = await request(app)
      .post("/api/v1/user") // Use your actual addUser endpoint
      .set("Authorization", `Bearer ${token}`) // Use the token obtained from login test
      .send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty("userId", res.body.user.userId);
    expect(res.body.user).toHaveProperty("name", newUser.name);
    expect(res.body.user).toHaveProperty("email", newUser.email);
    expect(res.body.user).toHaveProperty("role", newUser.role);
    expect(res.body.user).toHaveProperty("image", newUser.image);

    // Delete the test user after test
    await request(app)
      .delete(`/api/v1/user/${res.body.user.userId}`)
      .set("Authorization", `Bearer ${token}`);
  });

  it("should throw an error if role is not admin when add user", async () => {
    // New test user credentials
    const newUser = {
      name: "Test User",
      email: "testAdduser@gmail.com",
      password: "password",
      role: "user",
      image: "testimage.jpg",
    };
    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/v1/user") // Use your actual addUser endpoint
      .set("Authorization", `Bearer ${userToken}`) // Use the token obtained from a user role
      .send(newUser);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should update own user profile and generate new token", async () => {
    const updatedAdmin = {
      name: "Updated Test Admin",
      email: "updatedtestAdmin@gmail.com",
      password: "updatedtestpassword",
      role: "admin",
      image: "updatedtestimage.jpg",
    };

    const res = await request(app)
      .patch(`/api/v1/user/${testAdminId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedAdmin);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty("userId", testAdminId);
    expect(res.body.user).toHaveProperty("name", updatedAdmin.name);
    expect(res.body.user).toHaveProperty("email", updatedAdmin.email);
    expect(res.body.user).toHaveProperty("role", updatedAdmin.role);
    expect(res.body.user).toHaveProperty("image", updatedAdmin.image);
    expect(res.body).toHaveProperty("token");
  });
  it("should update other user and no generate new token", async () => {
    // Update test user credentials
    const updatedUser = {
      name: "Updated Test User",
      email: "updatedtestuser@gmail.com",
      password: "updatedtestpassword",
      role: "user",
      image: "updatedtestimage.jpg",
    };

    const res = await request(app)
      .patch(`/api/v1/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty("userId", testUserId);
    expect(res.body.user).toHaveProperty("name", updatedUser.name);
    expect(res.body.user).toHaveProperty("email", updatedUser.email);
    expect(res.body.user).toHaveProperty("role", updatedUser.role);
    expect(res.body.user).toHaveProperty("image", updatedUser.image);
    expect(res.body).not.toHaveProperty("token");
  });

  it("should throw an error if not all values are provided when updated user", async () => {
    const incompleteUser = {
      name: "Test User",
      email: "testuser@gmail.com",
      password: "testpassword",
      // role is missing
      image: "testimage.jpg",
    };
    const res = await request(app)
      .patch(`/api/v1/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Please provide all values");
  });

  it("should throw an error if role is not admin when update user", async () => {
    // Update test user credentials
    const updatedUser = {
      name: "Updated Test User",
      email: "updatedtestuser@gmail.com",
      password: "updatedtestpassword",
      role: "user",
      image: "updatedtestimage.jpg",
    };

    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .patch(`/api/v1/user/${testUserId}`) // Use your actual addUser endpoint
      .set("Authorization", `Bearer ${userToken}`) // Use the token obtained from a user role
      .send(updatedUser);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });

  it("should delete a user", async () => {
    const res = await request(app)
      .delete(`/api/v1/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", `Success delete user ${testUserId}`);

    // Verify user is deleted
    const user = await User.findByPk(testUserId);
    expect(user).toBeNull();
  });

  it("should throw an error if user not found when delete user", async () => {
    const nonExistentUserId = "nonExistentUserId";

    const res = await request(app)
      .delete(`/api/v1/user/${nonExistentUserId}`) // Use your actual deleteUser endpoint
      .set("Authorization", `Bearer ${token}`); // Use the token obtained from login test

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "msg",
      `No user with id ${nonExistentUserId}`
    );
  });

  it("should throw an error if role is not admin when delete user", async () => {
    const userToken = jwt.sign(
      {
        userId: testUserId,
        name: testUserName,
        email: testUserEmail,
        role: testUserRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .delete(`/api/v1/user/${testUserId}`) // Use your actual addUser endpoint
      .set("Authorization", `Bearer ${userToken}`) // Use the token obtained from a user role

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("msg", "Authentication Invalid");
  });
});
