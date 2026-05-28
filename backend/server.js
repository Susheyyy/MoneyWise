require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Initialize Database connection
connectDB();

// Global Middleware Ecosystem Stack
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Primary Gateway Router Implementations
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

app.get('/', (req, res) => {
  res.json({ infrastructure: 'BudgetBoss Pro Enterprise Core Core API Running Stable' });
});

// Structural Application Level Fallback Error Capturing Ecosystem
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ systemFault: true, message: 'Global execution failure trapped by core stack middleware framework' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Core Engine listening on allocation matrix channel node ${PORT}`));