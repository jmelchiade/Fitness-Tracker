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
    return routine_activity;
  } catch (error) {
    throw error;
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
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(
      `
    SELECT routine_activities.*
    FROM routine_activities
    WHERE "routineId"=$1
  `,
      [id]
    );
    if (!rows) {
      throw {
        name: "routineActivitiesNotFoundError",
        message: "Could not find a routine activity with that routine",
      };
    }
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(",");
  try {
    if (setString.length > 0) {
      const {
        rows: [routine_activity],
      } = await client.query(
        `
        UPDATE routine_activities
        SET ${setString}
        where id=${id}
        RETURNING *;
        `,
        Object.values(fields)
      );
      return routine_activity;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  const {
    rows: [routine_activity],
  } = await client.query(
    `
  DELETE FROM routine_activities
  WHERE id=$1
  RETURNING *
  `,
    [id]
  );
  return routine_activity;
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    SELECT * FROM routine_activities
    JOIN routines ON routines.id = routine_activities."routineId" 
    AND routine_activities.id = $1
    `,
      [routineActivityId]
    );
    if (userId === routine.creatorId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
