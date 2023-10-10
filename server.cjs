const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
require('dotenv').config();
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'src/')));

// Define a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests
app.use(limiter);

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});