// backend/index.js
const express = require('express');
const cors = require('cors');

// Import all our services
const { loadData, getProjects } = require('./dataService');
const { parseQuery } = require('./parserService');
const { searchProjects } = require('./searchService');
const { generateSummary } = require('./summaryService');

const app = express();
const PORT = 3001; // Backend server port
const allowedOrigins = [
  'https://no-brokerage-com-ai-chat-interface.vercel.app',
  'https://no-brokerage-com-ai-chat-interface-ae267va7f.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming request's origin is in our whitelist.
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// --- Middleware ---
// Allow requests from your frontend (which will run on a different port)
app.use(cors(corsOptions));// Allow the server to understand incoming JSON data
app.use(express.json());


// --- API Endpoints ---

// Main chat endpoint that drives the application
app.post('/api/chat', (req, res) => {
  // 1. Get the user's message from the request body
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  console.log(`Received query: "${message}"`);

  // 2. Parse the natural language message to get structured filters
  const filters = parseQuery(message);
  console.log('Extracted Filters:', filters);
  
  // 3. Get all the project data
  const allProjects = getProjects();

  // 4. Use the filters to search through the projects
  const foundProjects = searchProjects(allProjects, filters);
  const summaryReply = generateSummary(foundProjects, filters);
  console.log(`Found ${foundProjects.length} matching projects.`);

  // 5. Send the response back to the frontend
  res.json({
    reply: summaryReply,
    filters: filters,
    results: foundProjects, // This is the array of matching projects
  });
});


// --- Server Startup ---

// We must load the data BEFORE we start the server
console.log('Loading data...');
loadData()
  .then(() => {
    // Once data is loaded successfully, start the Express server
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // If data loading fails, log the error and don't start the server
    console.error('FATAL: Failed to load data. Server will not start.', error);
    process.exit(1); // Exit the process with an error code
  });