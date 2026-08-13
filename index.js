const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const pool = require("./db");
const supabase = require("./auth");

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
  const searchTask = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
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
  return res.status(200).json({ message: `task ${id} updated succesfully` });
};

const deleteTask = async (req, res) => {
  // const id = Number(req.params.id);
  const { id } = req.params;

  // const idToDelete = allTasks.findIndex((task) => task.id == id);
  const idToDelete = await pool.query("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1)", [id])
  if (idToDelete.rows[0].exists == false) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }
  // allTasks.splice(idToDelete, 1);
  await pool.query("DELETE FROM tasks WHERE id = $1", [id])
  return res.status(204).json({ message: `task ${id} deleted succesfully` });
};

const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Bad Request" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data.user ?? data);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Bad Request" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  if (!data?.session) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};

const signOut = async(req, res) =>{
  const { error } = await supabase.auth.signOut()
  return res.status(204).send()
}

const filterDone = (req, res) => {
  const filterCondition = req.params;
  const filtered = allTasks.filter((task) => (task.done = filterCondition));
  console.log(filtered);
};

const getPublicInfo = (req, res) =>{
  res.status(200).json({
    message: "Welcome stranger! This info is public."
  })
}

const authMiddleware = async(req, res, next) =>{
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access token required" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  const accessToken = parts[1];

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.locals.user = data
  next()
}

const getProtected = async (req, res) => {
  return res.status(200).json({ 
    message: "user profile", 
    userId: res.locals.user.user.id,
    userEmail: res.locals.user.user.email
  });
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

app.post("/auth/signup", signup);
app.post("/auth/login", login);
app.post("/auth/logout", authMiddleware, signOut);
app.get("/public/info", getPublicInfo)
app.get("/protected/profile", authMiddleware, getProtected)
app.get("/protected/dashboard",authMiddleware, getProtected)

// app.get('/allTasks', filterDone)

app.get("/docs", swaggerUi.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`To-do app listening on port ${port}`);
});
