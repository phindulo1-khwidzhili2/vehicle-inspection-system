const bcrypt = require("bcryptjs");

async function run() {
  const hash = await bcrypt.hash("12345", 10);
  console.log("HASH:", hash);
}

run();