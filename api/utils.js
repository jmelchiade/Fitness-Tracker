function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
      error: "Unauthorized",
    });
  }

  next();
}

module.exports = { requireUser };
