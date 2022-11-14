const express = require("express");
const {
  getAllRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  getActivityById,
  attachActivitiesToRoutines,
} = require("../db");
const client = require("../db/client");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");

// GET /api/routines
//Return a list of public routines, include the activities with them
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
//Create a new routine
routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const routineData = {
    name,
    goal,
    isPublic,
  };
  routineData.creatorId = req.user.id;
  try {
    const newRoutine = await createRoutine(routineData);
    res.send(newRoutine);
    next();
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// // PATCH /api/routines/:routineId
// //Update a routine, notably change public/private, the name, or the goal
// routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
//   const { routineId } = req.params;
//   const { isPublic, name, goal } = req.body;
//   const routine = await getRoutineById(routineId);
//   const updateFields = {};
//   if (isPublic === true || isPublic === false) {
//     updateFields.isPublic = isPublic;
//   }

//   if (name) {
//     updateFields.name = name;
//   }

//   if (goal) {
//     updateFields.goal = goal;
//   }
//   updateFields.id = routineId;

//   try {
//     if (routine.creatorId !== req.user.id) {
//       next({
//         name: "403",
//         message: `User ${req.user.username} is not allowed to update ${routine.name}`,
//         error: "403",
//       });
//       res.status(403);
//     } else {
//       const updatedRoutine = await updateRoutine(updateFields);
//       res.send(updatedRoutine);
//     }
//   } catch ({ name, message, error }) {
//     next({ name, message, error });
//   }
// });

// //ask in office hour-failing test for send 403 status either/or on delete and patch functions-why?
// // DELETE /api/routines/:routineId
// routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
//   try {
//     const routine = await getRoutineById(req.params.routineId);

//     if (routine && routine.creatorId === req.user.id) {
//       const destroyedData = await destroyRoutine(routine.id);
//       const returnData = destroyedData[0];
//       res.send(returnData);
//     } else {
//       next({
//         name: "UserAuthorizationError",
//         message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
//         error: "UserAuthorizationError",
//       });
//       res.status(403);
//     }
//   } catch ({ name, message, error }) {
//     next({ name, message, error });
//   }
// });

// POST /api/routines/:routineId/activities
//Attach a single activity to a routine. Prevent duplication on (routineId, activityId) pair.
routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  const { routineId } = req.params
  console.log("banana", req.body)
  try {
    const routine = await getRoutineById(routineId)
    console.log("apple", routine)
    const activity = await getActivityById(req.body.activityId)
    console.log("pineapple", activity)
    if (routine && activity) {
      const updatedRoutineWithActivity = await attachActivitiesToRoutines(routine)
      console.log("updated routine data!!", updatedRoutineWithActivity)
      res.send(updatedRoutineWithActivity)
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }

})

module.exports = routinesRouter;
