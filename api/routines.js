const express = require("express");
const {
  getAllRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
} = require("../db");
const client = require("../db/client");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");

// GET /api/routines
routinesRouter.get("/", async (req, res, next) => {
  try {
    const allRoutines = await getAllRoutines();
    const routines = allRoutines.filter((routines) => {
      return (
        routines.creatorId, routines.isPublic, routines.name, routines.goal
      );
    });
    res.send(routines);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/routines

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const routineData = {
    name,
    goal,
    isPublic,
  };
  routineData.creatorId = req.user.id;
  console.log("this is routineData", routineData);
  try {
    const newRoutine = await createRoutine(routineData);
    res.send(newRoutine);
    next();
  } catch ({ name, message }) {
    next({ name, message });
  }
});
//testing branch push to repo..Jen

// PATCH /api/routines/:routineId
routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const routine = await getRoutineById(routineId);
  const updateFields = {};
  // console.log("banana", isPublic);
  if (isPublic === true || isPublic === false) {
    updateFields.isPublic = isPublic;
  }

  if (name) {
    updateFields.name = name;
  }

  if (goal) {
    updateFields.goal = goal;
  }
  updateFields.id = routineId;
  // console.log("routine fields data here!", updateFields);

  try {
    if (routine.creatorId !== req.user.id) {
      next({
        name: "403",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
        error: "403",
      });
      res.status(403);
    } else {
      const updatedRoutine = await updateRoutine(updateFields);
      res.send(updatedRoutine);
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

//ask in office hour-failing test for send 403 status either/or on delete and patch functions-why?
// DELETE /api/routines/:routineId
routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);
    // const routine_activities = await getRoutineActivitiesByRoutine(routine);
    console.log(routine, "routine activities data");

    if (routine && routine.creatorId === req.user.id) {
      const destroyedData = await destroyRoutine(routine.id);
      console.log("banana", destroyedData);
      const returnData = destroyedData[0];

      console.log(returnData, "Orange!");
      res.send(returnData);
    } else {
      next({
        name: "UserAuthorizationError",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
        error: "UserAuthorizationError",
      });
      res.status(403);
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
