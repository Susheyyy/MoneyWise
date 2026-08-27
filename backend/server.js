require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const groupRoutes = require('./routes/groupRoutes');
const cookieParser = require('cookie-parser');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true
}));
app.use(cookieParser())
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/college/mess', require('./routes/messRoutes'));

app.get('/', (req, res) => {
  res.json({ infrastructure: 'API Running Stable' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ systemFault: true, message: 'Global execution failure trapped by core stack middleware framework' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));