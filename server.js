const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// РАЗДАВАЙ СТАТИЧЕСКИЕ ФАЙЛЫ
app.use(express.static(path.join(__dirname)));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API маршруты
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает!' });
});

app.get('/api/balance/:address', (req, res) => {
  const { address } = req.params;
  console.log(`Запрос баланса: ${address}`);
  const balance = (Math.random() * 10).toFixed(2);
  res.json({ address, balance, currency: 'TON' });
});

app.post('/api/withdraw', (req, res) => {
  const { address, amount } = req.body;

  if (!address || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  console.log(`Вывод: ${amount} TON на ${address}`);
  res.json({
    success: true,
    tx: 'fake_tx_' + Date.now(),
    amount,
    to: address
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});