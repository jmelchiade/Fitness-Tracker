/* eslint-disable no-useless-catch */
const client = require("./client");

// database functions
async function getAllActivities() {
  try {
    const { rows } = await client.query(`
    SELECT id, name, description 
    FROM activities;
   `);
    // console.log("line 11: this is rows activities data!!", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `SELECT *
      FROM activities
      WHERE id=${id};
      `
    );
    if (!activity) {
      throw {
        name: "ActivityNotFoundError",
        message: "Could not find an activity with that activityId",
      };
    }
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT * FROM activities
      WHERE name = $1;
    `,
      [name]
    );
    return activity;
  } catch (error) {
    throw error;
  }
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  // no side effects
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(", ");
  const routineIds = routines.map((routine) => routine.id);
  if (!routineIds?.length) return [];

  try {
    // get the activities, JOIN with routine_activities (so we can get a routineId), and only those that have those routine ids on the routine_activities join
    const { rows: activities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${binds});
    `,
      routineIds
    );

    // loop over the routines
    for (const routine of routinesToReturn) {
      // filter the activities to only include those that have this routineId
      const activitiesToAdd = activities.filter(
        (activity) => activity.routineId === routine.id
      );
      // attach the activities to each single routine
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    throw error;
  }
}

// return the new activity
async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
    INSERT INTO activities (name, description)
    VALUES($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING  id, name, description;
    `,
      [name, description]
    );
    return activity;
  } catch (error) {
    throw error;
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  console.log("line 111: our field data!!", fields);
  if (fields.name) {
    try {
      const {
        rows: [activity],
      } = await client.query(
        `
    UPDATE activities
    SET name=$1
    WHERE id = $2
    RETURNING *;
    `,
        [fields.name, id]
      );
      console.log("line 120: THIS IS UPDATED ACTIVITY", fields.name, activity);
      return activity;
    } catch (error) {
      throw error;
    }
  }

  if (fields.description) {
    try {
      const {
        rows: [activity],
      } = await client.query(
        `
    UPDATE activities
    SET description=$1
    WHERE id = $2
    RETURNING *;
    `,
        [fields.description, id]
      );
      console.log(
        "Line: 135: THIS IS UPDATED DESCRIPTION",
        fields.description,
        activity
      );
      return activity;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
