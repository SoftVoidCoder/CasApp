// Указываем URL вашего бэкенда - тот же домен где работает фронтенд
const API_URL = window.location.origin;

// Получить баланс
async function fetchBalance(address) {
  if (!address) return;
  try {
    const res = await fetch(`${API_URL}/api/balance/${address}`);
    if (!res.ok) throw new Error('Ошибка сервера');
    const data = await res.json();
    document.getElementById('balance').textContent = data.balance + ' TON';
    showStatus('Баланс обновлён', 'success');
  } catch (err) {
    console.error('Ошибка получения баланса:', err);
    showStatus('Ошибка сервера', 'error');
  }
}

// Вывести средства
async function withdraw() {
  if (!window.currentWalletAddress) {
    return showStatus('Сначала подключите кошелёк', 'error');
  }

  const amount = prompt('Сколько TON вывести?');
  if (!amount || isNaN(amount) || amount <= 0) {
    return showStatus('Неверная сумма', 'error');
  }

  try {
    const res = await fetch(`${API_URL}/api/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        address: window.currentWalletAddress, 
        amount: Number(amount) 
      })
    });

    if (!res.ok) throw new Error('Ошибка сервера');

    const data = await res.json();
    if (data.success) {
      showStatus(`✅ Вывод ${data.amount} TON успешен!`, 'success');
      // Обновляем баланс после вывода
      if (window.currentWalletAddress) {
        setTimeout(() => fetchBalance(window.currentWalletAddress), 2000);
      }
    } else {
      showStatus('❌ Ошибка вывода', 'error');
    }
  } catch (err) {
    console.error('Ошибка вывода:', err);
    showStatus('🔴 Ошибка сети', 'error');
  }
}

// Показать статус
function showStatus(text, type) {
  const el = document.getElementById('status');
  el.textContent = text;
  el.className = `alert mt-3`;
  
  if (type === 'success') {
    el.classList.add('alert-success');
  } else {
    el.classList.add('alert-error');
  }
  
  el.classList.remove('hidden');
  
  setTimeout(() => {
    el.classList.add('hidden');
  }, 5000);
}

// Инициализация Telegram Web App
function initTelegram() {
  if (window.Telegram && Telegram.WebApp) {
    const tg = Telegram.WebApp;
    
    // Расширяем на весь экран
    tg.expand();
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe?.user;
    
    if (user) {
      document.getElementById('userName').textContent = user.first_name || 'Пользователь';
      document.getElementById('userUsername').textContent = '@' + (user.username || 'username');
      
      if (user.photo_url) {
        document.getElementById('userPhoto').src = user.photo_url;
      }
    }
  }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', function() {
  initTelegram();
});

// Делаем функции доступными глобально
window.fetchBalance = fetchBalance;
window.withdraw = withdraw;