/* eslint-disable no-useless-catch */
const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");
const { getUserByUsername } = require("./users");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    SELECT * 
    FROM routines
    WHERE id=$1
  `,
      [id]
    );
    return routine;
  } catch (error) {
    console.log(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
  SELECT *
  FROM routines;
  `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(`
SELECT routines.*, users.username AS "creatorName"
FROM routines
JOIN users ON users.id = routines."creatorId"
`);
    const routines = attachActivitiesToRoutines(rows);
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const user = await getUserByUsername(username)
    console.log("the user data via username", user)
    const userId = user.id
    const { rows: [routines] } = await client.query(`
    SELECT *
    FROM routines
    WHERE "creatorId" = $1
    `, [userId])
    console.log("get all routines by user data here!!", routines)
    return routines;
  } catch (error) {
    throw error
  }
}

async function getPublicRoutinesByUser({ username }) {}

async function getAllPublicRoutines() {}

async function getPublicRoutinesByActivity({ id }) {}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
    INSERT INTO routines
    ("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
      [creatorId, isPublic, name, goal]
    );
    return routines;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {}


async function destroyRoutine(id) {
  const { rows: [routine_activities] } = await client.query(`
  DELETE FROM routine_activities
  WHERE "routineId" = $1
  RETURNING *
  `, [id])

  const { rows: [routine] } = await client.query(`
  DELETE FROM routines
  WHERE id=$1
  RETURNING *
`, [id]);

    return [routine, routine_activities]
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
