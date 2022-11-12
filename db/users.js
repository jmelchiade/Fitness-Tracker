/* eslint-disable no-useless-catch */
const { id_ID } = require("faker/lib/locales");
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  //   const SALT_COUNT = 10;
  // const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

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
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    if (user.password === password) {
      delete user.password;
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
