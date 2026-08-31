const env = require("./config/env");
const { buildApp } = require("./app");
const { connectDatabase } = require("./config/database");

// Fail fast on missing configuration instead of starting a server that
// cannot reach the database or that signs tokens with a public secret.
function assertConfig() {
  const problems = [];

  if (!env.mongoUri) {
    problems.push("MONGODB_URI is not set");
  }

  if (env.usingDevJwtSecret) {
    problems.push("JWT_SECRET is not set");
  }

  if (problems.length === 0) {
    return;
  }

  console.error("Invalid configuration, refusing to start:");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  console.error("See backend/.env.example.");

  process.exit(1);
}

async function start() {
  assertConfig();

  await connectDatabase();

  const { app } = buildApp();

  app.listen(env.port, () => {
    console.log(
      `API running on http://localhost:${env.port}`
    );

    console.log("Demo accounts:");
    console.log("- admin@local.test / admin123");
    console.log("- user@local.test / user123");
  });
}

start();
