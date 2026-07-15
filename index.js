const express = require('express');

const app = express();
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
    const searchTask = tasks.find(task => task.id === id)
    if (!searchTask) {
        return res.status(404).json({
            "error": `Task ${id} not found`
        })
    }
    return res.send(searchTask)
}

app.get('/tasks/:id', getTaskById)

const createNewTask = (req, res) => {
    if (!req.title) {
        return res.status(400).json({
            "error": "task title should not be empty"
        })
    }
    newTask = req
    const id = tasks.length - 1
    newTask.id = id
    newTask.done = false
    tasks.push(newTask)
    return res.send(newTask)
}

app.post('/tasks', createNewTask)

app.listen(port, () => {
    console.log(`To-do app listening on port ${port}`)
})