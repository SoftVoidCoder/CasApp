class WalletApp {
    constructor() {
        this.connector = null;
        this.wallet = null;
        this.userId = null;
        this.userBalance = 0;
        this.init();
    }

    async init() {
        // Telegram Web App
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        this.userId = this.tg.initDataUnsafe.user?.id || 'user_' + Date.now();
        
        // Инициализация TON Connect
        await this.initTonConnect();
        this.bindEvents();
        this.loadAppBalance();
    }

    async initTonConnect() {
        // Создаем кнопку подключения
        this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: window.location.origin + '/tonconnect.json',
            buttonRootId: 'tonconnect-button'
        });

        // Подписываемся на изменения статуса кошелька
        this.tonConnectUI.onStatusChange(wallet => {
            if (wallet) {
                this.wallet = wallet;
                this.onWalletConnected(wallet);
                this.loadWalletBalance();
            } else {
                this.wallet = null;
                this.onWalletDisconnected();
            }
        });
    }

    onWalletConnected(wallet) {
        document.getElementById('walletInfo').classList.remove('hidden');
        const shortAddress = wallet.account.address.slice(0, 8) + '...' + wallet.account.address.slice(-8);
        document.getElementById('walletAddress').textContent = shortAddress;
        this.showStatus('Кошелек подключен!', 'success');
    }

    onWalletDisconnected() {
        document.getElementById('walletInfo').classList.add('hidden');
        document.getElementById('walletBalance').textContent = '0 TON';
        this.showStatus('Кошелек отключен', 'error');
    }

    async loadWalletBalance() {
        if (!this.wallet) return;
        
        try {
            // Здесь будет запрос к TON API для получения баланса кошелька
            // Пока заглушка
            const balance = Math.random() * 100;
            document.getElementById('walletBalance').textContent = balance.toFixed(2) + ' TON';
        } catch (error) {
            console.error('Error loading wallet balance:', error);
        }
    }

    async loadAppBalance() {
        try {
            const response = await fetch(`/api/balance/${this.userId}`);
            const data = await response.json();
            this.userBalance = data.balance;
            document.getElementById('balance').textContent = this.userBalance + ' TON';
        } catch (error) {
            console.error('Error loading app balance:', error);
        }
    }

    bindEvents() {
        document.getElementById('disconnectWallet').addEventListener('click', () => {
            this.tonConnectUI.disconnect();
        });

        document.getElementById('depositBtn').addEventListener('click', () => {
            this.handleDeposit();
        });

        document.getElementById('withdrawBtn').addEventListener('click', () => {
            this.handleWithdraw();
        });
    }

    async handleDeposit() {
        const amount = document.getElementById('depositAmount').value;
        if (!amount || amount < 0.1) {
            this.showStatus('Минимальная сумма депозита: 0.1 TON', 'error');
            return;
        }

        if (!this.wallet) {
            this.showStatus('Подключите кошелек сначала', 'error');
            return;
        }

        try {
            // Создаем транзакцию для депозита
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
                messages: [
                    {
                        address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // Адрес для депозита
                        amount: (amount * 1000000000).toString(), // Конвертация в наноTON
                    }
                ]
            };

            // Отправляем транзакцию через кошелек
            const result = await this.tonConnectUI.sendTransaction(transaction);
            
            if (result) {
                // Сохраняем депозит в базу
                const response = await fetch('/api/deposit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: this.userId, 
                        amount: amount,
                        txHash: result.boc 
                    })
                });

                const data = await response.json();
                if (data.success) {
                    this.showStatus(`Депозит ${amount} TON успешен!`, 'success');
                    this.loadAppBalance();
                    document.getElementById('depositAmount').value = '';
                }
            }
        } catch (error) {
            this.showStatus('Ошибка депозита: ' + error.message, 'error');
        }
    }

    async handleWithdraw() {
        const amount = document.getElementById('withdrawAmount').value;
        if (!amount || amount < 0.1) {
            this.showStatus('Минимальная сумма вывода: 0.1 TON', 'error');
            return;
        }

        if (!this.wallet) {
            this.showStatus('Подключите кошелек сначала', 'error');
            return;
        }

        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: this.userId, 
                    amount: amount,
                    walletAddress: this.wallet.account.address 
                })
            });

            const data = await response.json();
            if (data.success) {
                this.showStatus(`Вывод ${amount} TON успешен!`, 'success');
                this.loadAppBalance();
                document.getElementById('withdrawAmount').value = '';
            } else {
                this.showStatus(data.error, 'error');
            }
        } catch (error) {
            this.showStatus('Ошибка вывода', 'error');
        }
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('transactionStatus');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.classList.remove('hidden');
        
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new WalletApp();
});