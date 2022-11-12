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
    throw error;
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
    const routines = await attachActivitiesToRoutines(rows);
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const userId = user.id;
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id=routines."creatorId"
    WHERE "creatorId" = $1
    `,
      [userId]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const userId = user.id;
    const { rows: routines } = await client.query(
      `
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "creatorId"=$1 
      AND "isPublic" = true
    `,
      [userId]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE "isPublic" = true
    `);
    const routines = await attachActivitiesToRoutines(rows);
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows } = await client.query(
      `
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId"=users.id
  JOIN routine_activities ON routines.id=routine_activities."routineId"
  WHERE "isPublic" = true
  AND routine_activities."activityId" = $1
  `,
      [id]
    );
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

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

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    // update any fields that need to be updated
    if (setString.length > 0) {
      const {
        rows: [routine],
      } = await client.query(
        `
  UPDATE routines
  SET ${setString}
  WHERE id=${id}
  RETURNING *;
`,
        Object.values(fields)
      );
      return routine;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  const {
    rows: [routine_activities],
  } = await client.query(
    `
  DELETE FROM routine_activities
  WHERE "routineId" = $1
  RETURNING *
  `,
    [id]
  );

  const {
    rows: [routine],
  } = await client.query(
    `
  DELETE FROM routines
  WHERE id=$1
  RETURNING *
`,
    [id]
  );

  return [routine, routine_activities];
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
