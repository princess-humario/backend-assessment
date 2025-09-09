const express = require('express');
const { getNotifications, initDatabase } = require('./consumer');

const app = express();
app.use(express.json());

// Initialize database when server starts
initDatabase();

// API to get all notifications
app.get('/notifications', async (req, res) => {
    try {
        const notifications = await getNotifications();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Notification Service API running on port ${PORT}`);
});