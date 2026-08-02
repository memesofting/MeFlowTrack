const pool = require("./db")

async function init(){
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      done BOOLEAN
    );
  `
  )
  console.log("database initialised");
  process.exit()
}

init();