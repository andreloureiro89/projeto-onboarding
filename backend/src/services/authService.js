const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { httpError } = require("../utils/httpError");

function toPublicUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  const { passwordHash, ...rest } = obj;
  return rest;
}

class AuthService {
  constructor(db) {
    this.db = db;
  }

  async register({ name, email, password, role = "user" }) {

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.db.createUser({
      name,
      email,
      passwordHash,
      role
    });

    return this.issueSession(user);
  }

  async login({ email, password }) {

    const user = await this.db.findUserByEmail(email);

    if (!user) {
      throw httpError(401, "invalid credentials");
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!valid) {
      throw httpError(401, "invalid credentials");
    }

    return this.issueSession(user);
  }

  async me(userId) {

    const user = await this.db.getUserById(userId);

    if (!user) {
      throw httpError(404, "user not found");
    }

    return toPublicUser(user);
  }

  issueSession(user) {

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        email: user.email
      },
      env.jwtSecret,
      {
        expiresIn: "8h"
      }
    );

    return {
      token,
      user: toPublicUser(user)
    };
  }
}

module.exports = { AuthService };