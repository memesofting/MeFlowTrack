const pool = require("./db")

async function seed() {
  const count = await pool.query("SELECT COUNT(*) FROM tasks");
  
  if (count.rows[0].count == 0){
    const tasks = [
      { title: "Clear desk", done: true },
      { title: "Clean the roomk", done: false },
      { title: "Close all windows", done: true }
    ];
  
    for (const task of tasks) {
      await pool.query("INSERT INTO tasks (title, done) VALUES ($1, $2)",
      [task.title, task.done])
    };
  }
  process.exit();
}

seed();