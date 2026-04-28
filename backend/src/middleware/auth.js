const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { httpError } = require("../utils/httpError");

function authRequired(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(httpError(401, "missing token"));
  }

  return jwt.verify(token, env.jwtSecret, (err, decoded) => {
    if (err) {
      return next(httpError(401, "invalid token"));
    }
    req.auth = decoded;
    return next();
  });
}

function roleRequired(...roles) {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(httpError(403, "forbidden"));
    }
    return next();
  };
}

module.exports = { authRequired, roleRequired };
