const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/wallet/connect', (req, res) => {
    const walletData = req.body;
    console.log('Wallet connected:', walletData);
    res.json(walletData);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});