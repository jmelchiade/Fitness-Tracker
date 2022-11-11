const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, getUserByUsername } = require("../db");
const { JWT_SECRET } = process.env;
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
  //duplicate user if statement should be in register not in login... Jen
  try {
    const user = await getUserByUsername(username);

    if (user) {
      next({
        name: "duplicateUser",
        message: `User ${username} already exists`,
        error: "error",
      });
    } else {
      const user = createUser({ username, password });
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );
    }

    if (user && user.password == password) {
      // create token & return to user

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );

      res.send({ user, message: "you're logged in!", token: token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
        error: "error",
      });
      return user;
    }
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
      message: "thank you for signing up",
      token,
      user,
    });
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
