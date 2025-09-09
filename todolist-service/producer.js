require('dotenv').config();
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ 
    clientId: process.env.KAFKA_CLIENT_ID_TODOLIST || 'todolist', 
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] 
});
const producer = kafka.producer();

const publishEvent = async (eventType, task) => {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC || 'task-events',
        messages: [{ key: eventType, value: JSON.stringify(task) }],
    });
    await producer.disconnect();
};

module.exports = { publishEvent };