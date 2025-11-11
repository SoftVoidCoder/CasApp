const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

let users = {};

app.get('/tonconnect.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'tonconnect.json'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/deposit', (req, res) => {
    const { userId, amount } = req.body;
    if (!users[userId]) {
        users[userId] = { balance: 0 };
    }
    users[userId].balance += parseFloat(amount);
    res.json({ success: true, balance: users[userId].balance });
});

app.post('/api/withdraw', (req, res) => {
    const { userId, amount } = req.body;
    if (!users[userId] || users[userId].balance < amount) {
        return res.json({ success: false, error: 'Недостаточно средств' });
    }
    users[userId].balance -= parseFloat(amount);
    res.json({ success: true, balance: users[userId].balance });
});

app.get('/api/balance/:userId', (req, res) => {
    const userId = req.params.userId;
    const balance = users[userId] ? users[userId].balance : 0;
    res.json({ balance });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});