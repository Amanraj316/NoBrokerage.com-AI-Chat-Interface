// backend/index.js
const express = require('express');
const cors = require('cors');
const { loadData, getProjects } = require('./dataService');
const { parseQuery } = require('./parserService');
const { searchProjects } = require('./searchService');
const { generateSummary } = require('./summaryService');

const app = express();
const PORT = 3001;

// CORS Configuration
const allowedOrigins = [
  'https://no-brokerage-com-ai-chat-interface.vercel.app',
  'https://no-brokerage-com-ai-chat-interface-ae267va7f.vercel.app'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Main Chat Endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const allProjects = getProjects();
  // Pass all projects to the parser to help it identify project names
  const filters = parseQuery(message, allProjects);
  
  const foundProjects = searchProjects(allProjects, filters);
  const summaryReply = generateSummary(foundProjects, filters);

  res.json({
    reply: summaryReply,
    filters: filters,
    results: foundProjects,
  });
});

// Server Startup
loadData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('FATAL: Failed to load data. Server will not start.', error);
    process.exit(1);
  });