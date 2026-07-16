const express = require('express');

const app = express();
app.use(express.json());

const port = 3000;

const tasks = [
    {
        "id": 1,
        "title": "Clear desk",
        "done": true
    },
    {
        "id": 2,
        "title": "Clean the room",
        "done": false
    },
    {
        "id": 3,
        "title": "Close all windows",
        "done": true
    }
]

app.get('/', (req, res) => {
    res.send({
        "name": "Task API",
        "version": "1.0",
        "endpoints": ["/tasks"]
    });
});

app.get('/health', (req, res) => {
    res.send({
        "status": "ok"
    })
})

app.get('/tasks', (req, res) => {
    res.send(tasks)
})

const getTaskById = (req, res) => {
    const { id } = req.params
    if (isNaN(id)){
        return res.status(400).json({
            error: "Task id should be a number"
        })
    }
    const searchTask = tasks.find(task => task.id == id)
    if (!searchTask) {
        return res.status(404).json({
            "error": `Task ${id} not found`
        })
    }
    return res.send(searchTask)
}


const createNewTask = (req, res) => {
    const {title} = req.body;
    if (!title) {
        comsole.log(title);
        return res.status(400).json({
            "error": "task title should not be empty"
        });
    }
    const id = tasks.length + 1
    const newTask = {
        id: id,
        title,
        done: false
    };
    tasks.push(newTask);
    return res.status(201).json(tasks)
}

app.get('/tasks/:id', getTaskById)

app.post('/tasks', createNewTask)

app.listen(port, () => {
    console.log(`To-do app listening on port ${port}`)
})