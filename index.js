const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");

const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve);

const port = 3000;

const allTasks = [
  {
    id: 1,
    title: "Clear desk",
    done: true,
  },
  {
    id: 2,
    title: "Clean the room",
    done: false,
  },
  {
    id: 3,
    title: "Close all windows",
    done: true,
  },
];

const getTasks = (req, res) => {
  const { done } = req.query;
  if (done){
      if (done == "true") {
        const filteredTasks = allTasks.filter((task) => task.done == true);
        return res.send(filteredTasks);
      }else if (done == "false"){
        const filteredTasks = allTasks.filter((task) => task.done == false);
        return res.send(filteredTasks);
      }
      else{
        return res.status(400).json({
            error: "Bad request, done can only be true or false"
        })
      }
  }
  res.send(allTasks);
};

const getTaskById = (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({
      error: "Task id should be a number",
    });
  }
  const searchTask = allTasks.find((task) => task.id == id);
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
  const id = allTasks.length + 1;
  const newTask = {
    id: id,
    title,
    done: false,
  };
  allTasks.push(newTask);
  return res.status(201).json(allTasks);
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

app.get("/allTasks", getTasks);

app.get("/allTasks/:id", getTaskById);

app.post("/allTasks", createNewTask);

app.put("/allTasks/:id", updateTask);

app.delete("/allTasks/:id", deleteTask);

// app.get('/allTasks', filterDone)

app.get("/docs", swaggerUi.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`To-do app listening on port ${port}`);
});
