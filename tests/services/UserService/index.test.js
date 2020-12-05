import User from "../../../dist/models/user";
import mongoose from "../../../dist/db/mongoose";
const conn = mongoose.connection;
const createUser = require("../../fixtures/createUser");
import UserService from "../../../dist/services/UserService";
const userService = new UserService();

let user;


const waitForDatabase = () => {

    return new Promise((resolve, reject) => {

        if (conn.readyState !== 1) {

            conn.once("open", () => {
                
                resolve();
    
            })

        } else {

            resolve();
        }
    
    })
}

beforeEach(async(done) => {

    await waitForDatabase();
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

    const {user: receivedUser} =  await userService.login(userData);

    expect(receivedUser._id.toString()).toBe(user._id.toString());
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

test("When giving user should logout and not throw error", async() => {

    await userService.logout(user);
})

test("When giving user, should logout all, show 0 tokens, and not throw error", async() => {

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

    const {user: createdUser} = await userService.create(userData);

    expect(createdUser.email).toBe(userData.email);
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
    
    const wrongOldPassword = "1649560569";
    const newPassword = "87654321";

    await expect(userService.changePassword(user._id, wrongOldPassword, newPassword)).rejects.toThrow();
})

test("When giving new password with insufficent length, should throw an error", async() => {

    const oldPassword = "12345678";
    const newPassword = "8765";

    await expect(userService.changePassword(user._id, oldPassword, newPassword)).rejects.toThrow();
})