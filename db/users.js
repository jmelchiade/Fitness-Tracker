/* eslint-disable no-useless-catch */
const { id_ID } = require("faker/lib/locales");
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  //   const SALT_COUNT = 10;
  // const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

  // console.log("username and password!!", username, password);
  try {
    const {
      rows: [user],
    } = await client.query(
      `
  INSERT INTO users(username, password)
  VALUES($1, $2)
  ON CONFLICT (username) DO NOTHING
  RETURNING id, username;
  `,
      [username, password]
    );
    // return user.id, user.username;
    // const userInfo = { user.id, user.username };
    // console.log(userInfo)
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    console.log("this is user data", user);
    if (user.password === password) {
      delete user.password
      console.log("if password verifies user data", user)
        return user;
    } 
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
  SELECT id, username
  FROM users
  WHERE id = ${userId}
  `);

    if (!user) {
      return null;
    }
    // console.log("getUserById return data", user);
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT * FROM users
    WHERE username = $1;
    `,
      [userName]
    );
    console.log("user by username data here!!", user)
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
