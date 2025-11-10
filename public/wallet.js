let tg = window.Telegram.WebApp;

function initTelegram() {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('userName').textContent = user.first_name || 'Игрок';
        if (user.photo_url) {
            document.getElementById('userAvatar').src = user.photo_url;
            document.getElementById('userAvatar').style.display = 'block';
        }
    }
}

async function connectWallet() {
    if (tg.platform !== 'unknown') {
        tg.showPopup({
            title: 'Подключение TON кошелька',
            message: 'Разрешить подключение к TON кошельку?',
            buttons: [
                {id: 'connect', type: 'default', text: 'Подключить'},
                {type: 'cancel'}
            ]
        }, (buttonId) => {
            if (buttonId === 'connect') {
                const walletData = {
                    address: "EQD" + Math.random().toString(36).substr(2, 10),
                    balance: (Math.random() * 1000).toFixed(2)
                };
                showWalletInfo(walletData);
                
                fetch('/api/wallet/connect', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(walletData)
                });
            }
        });
    } else {
        alert('Кошелек работает только в Telegram WebApp');
    }
}

function showWalletInfo(walletData) {
    document.getElementById('walletAddress').textContent = walletData.address;
    document.getElementById('walletBalance').textContent = walletData.balance;
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('balance').textContent = walletData.balance;
}

document.addEventListener('DOMContentLoaded', initTelegram);