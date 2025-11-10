const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/tonconnect-manifest.json', (req, res) => {
    res.json({
        "url": "https://your-casino.onrender.com",
        "name": "Telegram Casino",
        "iconUrl": "https://your-casino.onrender.com/icon.png",
        "termsOfUseUrl": "https://your-casino.onrender.com/terms",
        "privacyPolicyUrl": "https://your-casino.onrender.com/privacy"
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});