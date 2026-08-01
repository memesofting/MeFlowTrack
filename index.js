const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const Database = require("better-sqlite3")
// const {Pool} = require("pg")
const pool = require("./db")

const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve);

const port = 3000;

const getAllTasks = async (req, res) => {
  const allTasks = await pool.query("SELECT * FROM tasks");
  const { done } = req.query;
  if (done) {
    if (done == "true") {
      // const filteredTasks = allTasks.filter((task) => task.done == true);
      const filteredTasks = await pool.query("SELECT * FROM tasks WHERE done = true");
      return res.send(filteredTasks);
    } else if (done == "false") {
      // const filteredTasks = allTasks.filter((task) => task.done == false);
      const filteredTasks = await pool.query("SELECT * FROM tasks WHERE done = false");
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

const getTaskById = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({
      error: "Task id should be a number",
    });
  }
  // const searchTask = allTasks.find((task) => task.id == id);
  const searchTask = await pool.query("SELECT * FROM tasks WHERE id = $1",[id]);
  if (!searchTask) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  // console.log(searchTask)
  return res.send(searchTask);
};

const createNewTask = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    comsole.log(title);
    return res.status(400).json({
      error: "task title should not be empty",
    });
  }
  const newTask = {
    title,
    done: false,
  };
  // allTasks.push(newTask);
  await pool.query("INSERT INTO tasks (title, done) VALUES ($1, $2)", [newTask.title, newTask.done])
  const tasks = await pool.query("SELECT * FROM tasks");
  return res.status(201).json(tasks);
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  if (title == undefined || done == undefined) {
    return res.status(400).json({
      error: "Invalid body",
    });
  }
  // const toUpdate = allTasks.find((task) => task.id == id);
  const toUpdate = await pool.query("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1)", [id])
  // console.log(toUpdate)
  if (toUpdate.rows[0].exists == false) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  await pool.query("UPDATE tasks SET title = $1, done = $2 WHERE id = $3", [title, done, id])
  return res.status(200).json({message: `task ${id} updated succesfully`});
};

const deleteTask = async (req, res) => {
  // const id = Number(req.params.id);
  const {id} = req.params;

  // const idToDelete = allTasks.findIndex((task) => task.id == id);
  const idToDelete = await pool.query("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1)",[id])
  if (idToDelete.rows[0].exists == false) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  // allTasks.splice(idToDelete, 1);
  await pool.query("DELETE FROM tasks WHERE id = $1", [id])
  return res.status(204).json({message: `task ${id} deleted succesfully`});
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
