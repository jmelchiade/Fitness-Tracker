const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const user = await client.createUser(username, password);
    return user;  
  }
}

async function getUser({ username, password }) {

}

async function getUserById(userId) {

}

async function getUserByUsername(userName) {

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
