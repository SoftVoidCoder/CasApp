const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// In-memory storage
let users = new Map();

// TON Connect Manifest
app.get('/tonconnect-manifest.json', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({
        "url": baseUrl,
        "name": "TON Wallet App",
        "iconUrl": baseUrl + "/icon.png",
        "termsOfUseUrl": baseUrl + "/terms",
        "privacyPolicyUrl": baseUrl + "/privacy"
    });
});

// Simple icon endpoint
app.get('/icon.png', (req, res) => {
    res.send(`
        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" fill="#007bff" rx="15"/>
            <text x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">T</text>
        </svg>
    `);
});

// Terms and Privacy pages
app.get('/terms', (req, res) => {
    res.send(`
        <html><body><h1>Terms of Use</h1><p>Demo TON Wallet App</p></body></html>
    `);
});

app.get('/privacy', (req, res) => {
    res.send(`
        <html><body><h1>Privacy Policy</h1><p>We store minimal user data.</p></body></html>
    `);
});

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
    
    user.balance += parseFloat(amount);
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
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    let user = users.get(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    user.balance -= parseFloat(amount);
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