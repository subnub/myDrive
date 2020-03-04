const User = require("../../../src/models/user");
const mongoose = require("../../../src/db/mongoose");
const conn = mongoose.connection;
const createUser = require("../../fixtures/createUser");

const UserService = require("../../../src/services/UserService");
const userService = new UserService();

let user;

beforeEach(async(done) => {

    // user = await createUser();
    const {user: gotUser} = await createUser();
    user = gotUser;
    done();

})

afterEach(async(done) => {

    await User.deleteMany({});   
    done();
})

test("When giving email and password for login, should return user and token", async() => {

    const email = user.email;
    const password = "12345678";

    const userData = {
        email, 
        password
    }

    const {user: receivedUser, token} =  await userService.login(userData);

    expect(receivedUser._id.toString()).toBe(user._id.toString());
    expect(token.toString().length).not.toBe(0);
})

test("When giving wrong password for login, throw error", async() => {

    const email = user.email;
    const password = "87654321";

    const userData = {
        email, 
        password
    }

    await expect(userService.login(userData)).rejects.toThrow();
})

test("When giving user and token for logout, should remove token", async() => {

    const userID = user._id;
    const token = user.tokens[0].token;

    await userService.logout(user, token);
    const updatedUser = await User.findById(userID);

    expect(updatedUser.tokens.length).toBe(0);
})


test("When giving the wrong token, should not remove token", async() => {

    const userID = user._id;
    const wrongToken = "123456789012";

    await userService.logout(user, wrongToken);
    const updatedUser = await User.findById(userID);

    expect(updatedUser.tokens.length).toBe(1);
})

test("When giving user, should logout all", async() => {

    const userID = user._id;

    await userService.logoutAll(user);
    const updatedUser = await User.findById(userID);

    expect(updatedUser.tokens.length).toBe(0);
})

test("When giving user data, should create new user", async() => {

    const userData = {
        name: "Test User", 
        email: "test3@test.com", 
        password: "12345678",
    }

    const {user: createdUser, token} = await userService.create(userData);

    expect(createdUser.email).toBe(userData.email);
    expect(token.toString().length).not.toBe(0);
})

test("When creating user with duplicate email, should throw an error", async() => {

    const userData = {
        name: "Test User", 
        email: "test2@test.com", 
        password: "12345678",
    }

    await expect(userService.create(userData)).rejects.toThrow();
})

test("When giving user, token, old password, and new password. Should change password", async() => {

    const oldPassword = "12345678";
    const newPassword = "87654321";

    await userService.changePassword(user, oldPassword, newPassword);
})

test("When giving wrong old password for change password, should throw an error", async() => {
    
    const token = user.tokens[0].token;
    const wrongOldPassword = "1649560569";
    const newPassword = "87654321";

    await expect(userService.changePassword(user, token, wrongOldPassword, newPassword)).rejects.toThrow();
})

test("When giving new password with insufficent length, should throw an error", async() => {

    const token = user.tokens[0].token;
    const oldPassword = "12345678";
    const newPassword = "8765";

    await expect(userService.changePassword(user, token, oldPassword, newPassword)).rejects.toThrow();
})