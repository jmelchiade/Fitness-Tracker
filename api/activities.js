const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, getActivityByName, updateActivity, getActivityById, getPublicRoutinesByActivity } = require('../db');
const { requireUser } = require("./utils");

// GET /api/activities
activitiesRouter.get("/", async (req, res, next) => {
    try {
        const allActivities = await getAllActivities();
        res.send(allActivities);
    } catch ({ name, message, error }) {
        next({ name, message, error });
      }
})

// POST /api/activities
activitiesRouter.post("/", requireUser, async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const activity = await getActivityByName(name)
        if (activity) {
            next({
                name: "ActivityExistsError",
                message: `An activity with name ${name} already exists`,
                error: "ActivityExistsError",
            });
        }
        else {
            const activityData = {
                description,
                name
            };
            const newActivity = await createActivity(activityData)
            res.send(newActivity)
        }
    } catch ({ name, message, error }) {
        next({ name, message, error });
      }
})

// PATCH /api/activities/:activityId
activitiesRouter.patch("/:activityId", requireUser, async(req, res, next) => {

    const { activityId } = req.params;
    const { name, description } = req.body
    const updateFields = {};
    updateFields.id = Number(activityId)

    if (name) {
        updateFields.name = name
    }
    if (description) {
        updateFields.description = description
    }

    try {
    const activity = await getActivityById(activityId);
    if (!activity) {
        next({
            name: "ActivityNotFoundError",
            message: `Activity ${activityId} not found`,
            error: "ActivityNotFoundError"
        });
    }

    const activityNameCheck = await getActivityByName(name);
    if (activityNameCheck) {
        next({
            name: "ActivityExistsError",
            message: `An activity with name ${name} already exists`,
            error: "ActivityExistsError",
        });
    }

    else {
        const updatedActivity = await updateActivity(updateFields);
        res.send(updatedActivity);
    }
} catch ({ name, message, error }) {
    next({ name, message, error });
    }
})

// GET /api/activities/:activityId/routines
activitiesRouter.get("/:activityId/routines", async(req, res, next) => {
    const { activityId } = req.params;
    try {
        const activity = await getActivityById(activityId)
        if (!activity) {
            next({
                name: "ActivityNotFoundError",
                message: `Activity ${activityId} not found`,
                error: "ActivityNotFoundError"
            });
        }
        else {
            const publicRoutines = await getPublicRoutinesByActivity(activity)
            res.send(publicRoutines)
        }

    }  catch ({ name, message, error }) {
            next({ name, message, error });
            }
})



module.exports = activitiesRouter;
