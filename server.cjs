const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'src/')));

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + './public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


