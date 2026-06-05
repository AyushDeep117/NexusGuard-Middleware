const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = 3000;
const Redis = require('ioredis');
// Apply the Security Shield to all incoming requests
app.use(rateLimiter);

// A dummy "Financial Transaction" route (Target: Visa/BNY)
app.post('/api/v1/transfer', (req, res) => {
  res.json({ 
    status: 'Success', 
    message: 'Transaction processed securely.' 
  });
});

// A dummy "Social Feed" route (Target: Amazon/Cisco)
app.get('/api/v1/feed', (req, res) => {
  res.json({ 
    status: 'Success', 
    data: ['Post 1', 'Post 2', 'Post 3'] 
  });
});

app.listen(PORT, () => {
  console.log(`Z Server running on http://localhost:${PORT}`);
});