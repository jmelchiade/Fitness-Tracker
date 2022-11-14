const express = require("express");
const { getAllRoutines, createRoutine, getRoutineById } = require("../db");
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
  const routines = {};
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const updateFields = { isPublic, name, goal };

  if (routines && routines.length > 0) {
    updateFields.routines = routines.trim().split(/\s+/);
  }

  if (isPublic) {
    updateFields.content = isPublic;
  }

  if (name) {
    updateFields.title = name;
  }

  if (goal) {
    updateFields.content = goal;
  }

  try {
    const originalRoutine = await getRoutineById(routineId);

    if (originalRoutine.name.id === req.user.id) {
      const updateRoutine = await updateRoutine(routineId, updateFields);
      res.send({ post: updateRoutine });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a routine that is not yours",
        error: "UnauthorizedUserError",
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
