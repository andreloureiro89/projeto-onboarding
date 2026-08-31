require("dotenv").config();

// Fallback used only so that unit tests can sign tokens without a .env file.
// server.js refuses to start while this value is in use.
const DEV_JWT_SECRET = "dev-secret-change-me";

const env = {
  port: Number(process.env.PORT || 3000),

  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,

  usingDevJwtSecret: !process.env.JWT_SECRET,

  frontendOrigin:
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:4200",

  mongoUri: process.env.MONGODB_URI,

  // Minimum score required to pass a quiz. Kept configurable so the
  // threshold is not hardcoded in the service layer.
  quizPassingScore: Number(process.env.QUIZ_PASSING_SCORE || 70)
};

module.exports = env;
