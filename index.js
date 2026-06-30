const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

// Hardcoded log directory inside the container - bind-mount this to the host
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'server.log');

function writeLog(message) {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFile, line);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

// SABOTAGE 1: Expects a very specific environment variable name!
const dbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/phoenix';

mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Failed to connect:', err));

// FIX: Vite builds the frontend to 'dist', so serve from there instead of 'public'.
const uiPath = path.join(__dirname, 'dist');
app.use(express.static(uiPath));

app.get('/api/health', (req, res) => {
  writeLog('Health check hit - API is alive');
  res.json({ status: 'API is alive' });
});

app.listen(5000, () => console.log('Server running on port 5000'));