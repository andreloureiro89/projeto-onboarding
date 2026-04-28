const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { httpError } = require("../utils/httpError");

function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

class AuthService {
  constructor(db) {
    this.db = db;
  }

  register({ name, email, password, role = "user" }) {
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = this.db.createUser({ name, email, passwordHash, role });
    return this.issueSession(user);
  }

  login({ email, password }) {
    const user = this.db.findUserByEmail(email);
    if (!user) {
      throw httpError(401, "invalid credentials");
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      throw httpError(401, "invalid credentials");
    }

    return this.issueSession(user);
  }

  me(userId) {
    const user = this.db.getUserById(userId);
    if (!user) {
      throw httpError(404, "user not found");
    }
    return toPublicUser(user);
  }

  issueSession(user) {
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, {
      expiresIn: "8h",
    });

    return {
      token,
      user: toPublicUser(user),
    };
  }
}

module.exports = { AuthService };
