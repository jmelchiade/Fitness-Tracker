const express = require("express");
const { getAllRoutines, createRoutine } = require("../db");
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

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
