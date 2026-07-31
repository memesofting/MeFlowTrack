const pool = require("./db")

async function init(){
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      done BOOLEAN
    );
  `
  )
  console.log("database initialised");
  process.exit()
}

init();