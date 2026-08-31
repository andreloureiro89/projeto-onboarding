const { httpError } = require("./httpError");

const MIN_PASSWORD_LENGTH = 8;

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw httpError(400, `${field} is required`);
  }
  return value.trim();
}

function requiredEmail(value) {
  const email = requiredString(value, "email").toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw httpError(400, "email is invalid");
  }
  return email;
}

function requiredPassword(value) {
  const password = requiredString(value, "password");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw httpError(
      400,
      `password must have at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }
  return password;
}

function oneOf(value, field, options) {
  if (!options.includes(value)) {
    throw httpError(400, `${field} must be one of: ${options.join(", ")}`);
  }
  return value;
}

module.exports = {
  requiredString,
  requiredEmail,
  requiredPassword,
  oneOf,
  MIN_PASSWORD_LENGTH
};
