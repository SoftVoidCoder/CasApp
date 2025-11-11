// Указываем URL вашего бэкенда на Render
const API_URL = 'https://casapp-backend.onrender.com';

// Получить баланс
async function fetchBalance(address) {
  if (!address) return;
  try {
    const res = await fetch(`${API_URL}/api/balance/${address}`);
    const data = await res.json();
    document.getElementById('balance').textContent = data.balance + ' TON';
    showStatus('Баланс обновлён', 'success');
  } catch (err) {
    showStatus('Ошибка сервера', 'error');
  }
}

// Вывести средства
async function withdraw() {
  const amount = prompt('Сколько TON вывести?');
  if (!amount || isNaN(amount) || amount <= 0) {
    return showStatus('Неверная сумма', 'error');
  }

  const address = prompt('Введите адрес кошелька:');
  if (!address) return;

  try {
    const res = await fetch(`${API_URL}/api/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, amount: Number(amount) })
    });

    const data = await res.json();
    if (data.success) {
      showStatus(`✅ Вывод: ${data.amount} TON`, 'success');
    } else {
      showStatus('❌ Ошибка вывода', 'error');
    }
  } catch (err) {
    showStatus('🔴 Ошибка сети', 'error');
  }
}

// Показать статус
function showStatus(text, type) {
  const el = document.getElementById('status');
  el.textContent = text;
  el.className = `alert alert-${type} mt-3`;
  setTimeout(() => {
    el.classList.add('hidden');
  }, 3000);
}

// Делаем функции доступными глобально
window.fetchBalance = fetchBalance;
window.withdraw = withdraw;
