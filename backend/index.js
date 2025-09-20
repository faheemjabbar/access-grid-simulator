require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const simulateRoute = require('./routes/simulate');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// connect to mongo
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// mount your simulation routes
app.use('/api/simulate', simulateRoute);

// health check
app.get('/', (req, res) => res.send('Access Grid Simulator Backend'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
