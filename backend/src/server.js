const env = require("./config/env");
const { buildApp } = require("./app");

const { app } = buildApp();

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  console.log("Demo accounts:");
  console.log("- admin@local.test / admin123");
  console.log("- user@local.test / user123");
});
