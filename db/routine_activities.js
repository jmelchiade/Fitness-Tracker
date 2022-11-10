/* eslint-disable no-useless-catch */
const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
    SELECT * 
    FROM routine_activities
    WHERE id=$1
  `,
      [id]
    );
    console.log("This is routine activity data", routine_activity);
    return routine_activity;
  } catch (error) {
    console.log(error);
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
    INSERT INTO routine_activities ( "routineId", "activityId", count , duration)
    VALUES($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );
    console.log("This is adding activity to routine", routineActivity);
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
    SELECT routine_activities.*
    FROM routine_activities
    WHERE "routineId"=$1
  `,
      [routine_activity]
    );
    if (!rows) {
      throw {
        name: "routineActivitiesNotFoundError",
        message: "Could not find a routine activity with that routine",
      };
    }
    console.log("This is routine activity by routine", routine_activity);
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {}

async function destroyRoutineActivity(id) {}

async function canEditRoutineActivity(routineActivityId, userId) {}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
