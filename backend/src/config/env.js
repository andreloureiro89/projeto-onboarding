require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 3000),

  jwtSecret:
    process.env.JWT_SECRET ||
    "dev-secret-change-me",

  frontendOrigin:
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:4200",

  mongoUri:
    process.env.MONGODB_URI
};

module.exports = env;