const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getPublicRoutinesByUser, getAllRoutinesByUser } = require("../db/routines.js");
const { createUser, getUserByUsername, } = require("../db/users.js");
const { JWT_SECRET } = process.env;
// const { token } = require("morgan");
const { requireUser } = require("./utils");

// POST /api/users/login

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );
      const userData = jwt.verify(token, JWT_SECRET);
      res.send({ user, message: "you're logged in!", token });
      return userData;
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
    return user;
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (password.length < 8) {
      next({
        name: "PasswordLengthError",
        message: "Password Too Short!",
        error: "error",
      });
    }

    if (_user) {
      next({
        name: "duplicateUser",
        message: `User ${username} is already taken.`,
        error: "error",
      });
    } else {
      const user = await createUser({
        username,
        password,
      });

      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      res.send({
        message: "Thanks for signing up",
        token,
        user,
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

// GET /api/users/me

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    if (req.user) {
      res.send(req.user);
    } else {
      next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action",
        error: "MissingUserError",
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

// GET /api/users/:username/routines
usersRouter.get("/:username/routines", async(req, res, next) => {
  try {
    const username = req.params;
    const routines = await getPublicRoutinesByUser(username);
    res.send(routines)
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
}) 

//previous func is pass both tests but im unsure if its working as intended
//should we get return the username routines AND current user routines?
//or are these separate things based on a logged in user or not?
//if so, do we get all routines and filter accordingly or can we res.send 
//two separate objects of data-unsure how currently

// usersRouter.get("/:username/routines", async(req, res, next) => {
//   try {
//     const username = req.params;
//     const userRoutines = await getPublicRoutinesByUser(username);
//     // res.send(userRoutines)
  
//     if (req.user) {
//       const currentUserUsername = req.user.username
//       const currentUserRoutines = await getAllRoutinesByUser(currentUserUsername)
//       console.log("banana", currentUserUsername, currentUserRoutines)
//       res.send({userRoutines, currentUserRoutines})
//     }
  
//   } catch ({ name, message, error }) {
//     next({ name, message, error });
//   }
// }) 

module.exports = usersRouter;
