import express from 'express';
import serveStatic from 'serve-static';
import path from 'path';

// Create an Express app
const app = express();

// Serve static files from the 'dist' directory
app.use('/', serveStatic(path.join(process.cwd(), 'dist')));

// Catch-all route to serve the SPA for any route
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Set the port from environment or default to 8080
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});