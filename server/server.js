const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// In-memory storage (in production use database)
let users = new Map();

// API Routes
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    const user = users.get(userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
});

app.post('/api/user', (req, res) => {
    const { userId, balance = 0, transactions = [] } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = { userId, balance, transactions };
    users.set(userId, user);
    
    res.status(201).json(user);
});

app.post('/api/deposit', (req, res) => {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
        return res.status(400).json({ error: 'User ID and amount are required' });
    }
    
    let user = users.get(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Update balance
    user.balance += parseFloat(amount);
    
    // Simulate transaction hash
    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    res.json({
        success: true,
        newBalance: user.balance,
        transactionHash
    });
});

app.post('/api/withdraw', (req, res) => {
    const { userId, amount, walletAddress } = req.body;
    
    if (!userId || !amount || !walletAddress) {
        return res.status(400).json({ error: 'User ID, amount and wallet address are required' });
    }
    
    let user = users.get(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Update balance
    user.balance -= parseFloat(amount);
    
    // Simulate transaction hash
    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    res.json({
        success: true,
        newBalance: user.balance,
        transactionHash
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});