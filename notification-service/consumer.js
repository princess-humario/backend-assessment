require('dotenv').config();
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'notifications_db',
    password: process.env.DB_PASSWORD || 'localhost', 
    port: process.env.DB_PORT || 5432,
});

const kafka = new Kafka({ 
    clientId: process.env.KAFKA_CLIENT_ID_NOTIFICATION || 'notification-service', 
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    connectionTimeout: process.env.KAFKA_CONNECTION_TIMEOUT || 10000,
    requestTimeout: process.env.KAFKA_REQUEST_TIMEOUT || 30000
});
const consumer = kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP || 'notification-group' });

// Initialize database table
const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                task_id INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized');
        await consumeMessages();
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

const consumeMessages = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC || 'task-events' });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const eventType = message.key.toString();
            const task = JSON.parse(message.value.toString());
            
            const notificationMessage = generateNotificationMessage(eventType, task);
            
            // Save to PostgreSQL
            try {
                await pool.query(
                    'INSERT INTO notifications (message, event_type, task_id) VALUES ($1, $2, $3)',
                    [notificationMessage, eventType, task.id]
                );
                console.log('Notification saved:', notificationMessage);
            } catch (error) {
                console.error('Database save error:', error);
            }
        },
    });
};

const generateNotificationMessage = (eventType, task) => {
    switch (eventType) {
        case 'task_created':
            return `New task created: "${task.title}"`;
        case 'task_updated':
            return `Task updated: "${task.title}"`;
        case 'task_deleted':
            return `Task deleted: "${task.title}"`;
        default:
            return `Task event: ${eventType}`;
    }
};

const getNotifications = async () => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
        return result.rows;
    } catch (error) {
        console.error('Database fetch error:', error);
        return [];
    }
};

module.exports = { consumeMessages, getNotifications, initDatabase };