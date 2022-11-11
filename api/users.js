const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername } = require("../db/users.js");
const { JWT_SECRET } = process.env;
const { token } = require("morgan");
const { requireUser } = require("./utils");

// POST /api/users/login

userRouter.post("/login", async (req, res, next) => {
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
userRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (password.length < 8) {
      next({
        name: "PasswordLengthError",
        message: "Password must be a minimum of 8 characters",
        error: "error",
      });
    }

    const user = await getUserByUsername(username);

    if (user) {
      next({
        name: "duplicateUser",
        message: `User ${username} already exists`,
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
        process.env.JWT_SECRET,
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

// userRouter.get("/me", requireUser, async (req, res, next) => {
//   try {
//     if (req.user) {
//       res.send(req.user);
//     } else {
//       next({
//         name: "RequireUserError",
//         message: "",
//         error: "",
//       });
//     }
//   } catch ({ name, message, error }) {
//     next({ name, message, error });
//   }
// });

// GET /api/users/:username/routines

module.exports = userRouter;
