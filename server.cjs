const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'src/')));

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + './public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});