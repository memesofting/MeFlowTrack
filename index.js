const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const Database = require("better-sqlite3")

const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve);

const port = 3000;

const db = new Database("tasks.db")

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    done INTEGER
  );
`
db.exec(createTableQuery)

// check for empty table befor seeding
const count = db.prepare("SELECT COUNT(*) FROM tasks").get()

if (count == 0){
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
  
  const insertTasks = db.transaction(
    (tasks) => {
      for (const task of tasks) insert.run(task.title, task.done);
    }
  );
  
  insertTasks([
    { title: "Clear desk", done: 1 },
    { title: "Clean the roomk", done: 0 },
    { title: "Close all windows", done: 1 }
  ])
}

const allTasks = db.prepare("SELECT * FROM tasks").all();

const getAllTasks = (req, res) => {
  const { done } = req.query;
  if (done) {
    if (done == "true") {
      // const filteredTasks = allTasks.filter((task) => task.done == true);
      const filteredTasks = db.prepare("SELECT * FROM tasks WHERE done = 1").all();
      return res.send(filteredTasks);
    } else if (done == "false") {
      // const filteredTasks = allTasks.filter((task) => task.done == false);
      const filteredTasks = db.prepare("SELECT * FROM tasks WHERE done = 0").all();
      return res.send(filteredTasks);
    }
    else {
      return res.status(400).json({
        error: "Bad request, done can only be true or false"
      })
    }
  }
  res.send(allTasks)
};

const getTaskById = (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({
      error: "Task id should be a number",
    });
  }
  // const searchTask = allTasks.find((task) => task.id == id);
  const searchTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!searchTask) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  return res.send(searchTask);
};

const createNewTask = (req, res) => {
  const { title } = req.body;
  if (!title) {
    comsole.log(title);
    return res.status(400).json({
      error: "task title should not be empty",
    });
  }
  const newTask = {
    title,
    done: 0,
  };
  // allTasks.push(newTask);
  db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(newTask.title, newTask.done)
  const tasks = db.prepare("SELECT * FROM tasks").all();
  return res.status(201).json(tasks);
};

const updateTask = (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  if (title == undefined || done == undefined) {
    return res.status(400).json({
      error: "Bad request",
    });
  }
  const toUpdate = allTasks.find((task) => task.id == id);
  if (!toUpdate) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  toUpdate.title = title;
  toUpdate.done = done;
  return res.status(200).send();
};

const deleteTask = (req, res) => {
  const id = Number(req.params.id);

  const idToDelete = allTasks.findIndex((task) => task.id == id);
  if (idToDelete === -1) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  allTasks.splice(idToDelete, 1);
  return res.status(204).send();
};

const filterDone = (req, res) => {
  const filterCondition = req.params;
  const filtered = allTasks.filter((task) => (task.done = filterCondition));
  console.log(filtered);
};

app.get("/", (req, res) => {
  res.send({
    name: "Task API",
    version: "1.0",
    endpoints: ["/allTasks"],
  });
});

app.get("/health", (req, res) => {
  res.send({
    status: "ok",
  });
});

app.get("/tasks", getAllTasks);

app.get("/tasks/:id", getTaskById);

app.post("/tasks", createNewTask);

app.put("/tasks/:id", updateTask);

app.delete("/tasks/:id", deleteTask);

// app.get('/allTasks', filterDone)

app.get("/docs", swaggerUi.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`To-do app listening on port ${port}`);
});
