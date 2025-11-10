import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/tonconnect-manifest.json', (req, res) => {
    res.json({
        "url": "https://your-casino.onrender.com",
        "name": "Telegram Casino",
        "iconUrl": "https://your-casino.onrender.com/icon.png",
        "termsOfUseUrl": "https://your-casino.onrender.com/terms",
        "privacyPolicyUrl": "https://your-casino.onrender.com/privacy"
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})