const express = require('express');
const path = require('path'); // Required for absolute path resolution

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Optional: A basic route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});