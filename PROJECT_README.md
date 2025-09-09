# Kafka Integration with TodoList and Notification Services

This project shows integration of Kafka for communication between a TodoList service and a Notification service with PostgreSQL. 

##  Architecture Overview

```
┌─────────────────┐    Kafka Events    ┌─────────────────────┐
│   TodoList      │ ─────────────────► │   Notification      │
│   Service       │                    │   Service           │
│   (Port 3000)   │                    │   (Port 3001)       │
└─────────────────┘                    └─────────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
┌─────────────────┐                    ┌─────────────────────┐
│     Kafka       │                    │    PostgreSQL       │
│  (Port 9092)    │                    │    Database         │
└─────────────────┘                    └─────────────────────┘
```

##  Requirements Met

-  Kafka producer setup in TodoList application  
-  Kafka consumer implementation in Notification service  
-  Notification storage mechanism (PostgreSQL)  
-  Notifications API for retrieving notifications  
-  Complete setup and execution documentation  
-  Proper work flow  

##  Tech Stack

- **Backend**: Node.js with Express.js
- **Message Broker**: Apache Kafka 3.7.0
- **Database**: PostgreSQL 17
- **Containerization**: Docker & Docker Compose
- **Kafka Client**: KafkaJS v2.2.4
- **Database Client**: node-postgres (pg) v8.16.3

##  Project Structure

```
backend_assessment/
├── todolist-service/
│   ├── app.js              # Main TodoList application (from boilerplate)
│   ├── producer.js         # Kafka producer configuration (from boilerplate)
│   ├── package.json        
│   └── node_modules/       
├── notification-service/
│   ├── app.js              # Notification API server
│   ├── consumer.js         # Kafka consumer & PostgreSQL integration
│   ├── package.json       
│   └── node_modules/       
├── docker-compose.yml      # Kafka and PostgreSQL configuration
├── README.md              # Original task requirements
└── PROJECT_README.md      
```

##  Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js (v14 or higher)
- PostgreSQL database named `notifications_db`

### 1. Start Infrastructure Services

```powershell
docker-compose up -d
```

### 2. Install Dependencies

```powershell
cd todolist-service
npm install
  
cd ../notification-service
npm install
```

### 3. Start Application Services

```powershell
# Terminal 1: Start TodoList service
cd todolist-service
npm start
#  Service running on http://localhost:3000

# Terminal 2: Start Notification service
cd notification-service  
npm start
#  Service running on http://localhost:3001
```

##  Testing the Complete Workflow

### 1. Create a Task (Triggers task_created event)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/tasks" -Method POST -Headers @{"Content-Type"="application/json"}-Body '{"title": "Demo Task", "description": "Testing for screenshot", "status": "pending"}'

```

### 2. Update a Task (Triggers task_updated event)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/tasks/5" -Method PUT -Headers @{"Content-Type"="application/json"}-Body '{"title": "Updated Demo Task", "status": "completed"}'

```

### 3. Delete a Task (Triggers task_deleted event)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/tasks/5" -Method DELETE

```

### 4. Retrieve All Notifications
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/notifications" -Method GET

```

##  API Documentation

### TodoList Service (Port 3000)

| Method | Endpoint      | Description        | Request Body |
|--------|---------------|--------------------|--------------|
| POST   | `/tasks`      | Create a new task  | `{"title": "string", "description": "string", "status": "string"}` |
| PUT    | `/tasks/:id`  | Update a task      | `{"title": "string", "description": "string", "status": "string"}` |
| DELETE | `/tasks/:id`  | Delete a task      | None |

### Notification Service (Port 3001)

| Method | Endpoint         | Description           | Response |
|--------|------------------|-----------------------|----------|
| GET    | `/notifications` | Get all notifications | Array of notification objects |


##  Kafka Events Schema

### Topic: `task-events`

**Event Types:**
- `task_created` - When a new task is created
- `task_updated` - When an existing task is modified  
- `task_deleted` - When a task is removed

**Event Format:**
```json
{
  "key": "task_created",
  "value": {
    "id": 1,
    "title": "Learn Kafka",
    "description": "Study Apache Kafka basics",
    "status": "pending"
  }
}
```

##  Database Schema

### PostgreSQL - `notifications` table

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    task_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##  Docker Configuration

### docker-compose.yml Features

- **Kafka KRaft Mode**: Single node configuration for development
- **Multi Listener Setup**: Separate listeners for host and container access
- **PostgreSQL Integration**: Persistent volume for data storage
- **Health Checks**: Ensures services are ready before connections
- **Auto Topic Creation**: Automatic topic creation for development ease

##  Submission by

**Huma Tahir**  
Backend Developer Assessment - Kafka Integration Project

---

