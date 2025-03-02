# Kafka Integration Hiring Task

## Task Overview
You are required to integrate Kafka into a TodoList application and set up a Notification Service. The TodoList APIs are already built, and your job is to:

1. Publish a Kafka event whenever a task is **created**, **updated**, or **deleted**.
2. Develop a Notification Service that:
   - Consumes these Kafka messages.
   - Generates appropriate notifications.
   - Provides an API to retrieve notifications.

## Requirements 
- Set up **Kafka producer** in the TodoList application to publish task events.
- Develop a **Kafka consumer** in the Notification Service to consume these events.
- Implement a **notification storage mechanism** (in-memory database, SQLite, or any lightweight database).
- Build a **notifications API** to allow users to fetch notifications.
- Provide a clear README explaining setup and execution.

## Tech Stack
- Backend: **Node.js (Express.js)**
- Kafka: **Apache Kafka**
- Database: **SQLite/PostgreSQL/MongoDB (optional)**

## Project Structure
```
/kafka-todo-app
│── /todolist-service
│   ├── producer.js  (Kafka producer setup)
│   ├── app.js       (Main application logic)
│── /notification-service
│── docker-compose.yml (Kafka setup)
│── README.md
```

## Boilerplate Code

### TodoList Service - Kafka Producer (producer.js)
```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'todolist', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const publishEvent = async (eventType, task) => {
    await producer.connect();
    await producer.send({
        topic: 'task-events',
        messages: [{ key: eventType, value: JSON.stringify(task) }],
    });
    await producer.disconnect();
};

module.exports = { publishEvent };
```

### TodoList Service - Main Application (app.js)
```javascript
const express = require('express');
const { publishEvent } = require('./producer');

const app = express();
app.use(express.json());

let tasks = [];

app.post('/tasks', async (req, res) => {
    const task = { id: tasks.length + 1, ...req.body };
    tasks.push(task);
    await publishEvent('task_created', task);
    res.status(201).json(task);
});

app.put('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    await publishEvent('task_updated', tasks[taskIndex]);
    res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    await publishEvent('task_deleted', deletedTask);
    res.json(deletedTask);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`TodoList Service running on port ${PORT}`));
```

## Setup Instructions

### 1. Prerequisites
- Install **Docker & Docker Compose** (recommended for Kafka setup)
- Install **Node.js**

### 2. Start Kafka Using Docker
```sh
docker-compose up -d
```

### 3. Run TodoList Service
```sh
cd todolist-service
npm install  
npm start    
```

## Evaluation Criteria
- Code quality & best practices.
- Proper Kafka integration.
- Well-structured & documented code.

Happy coding!

