class WalletApp {
    constructor() {
        this.userId = null;
        this.init();
    }

    init() {
        // Инициализация Telegram Web App
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        this.userId = this.tg.initDataUnsafe.user?.id;
        
        // Инициализация TON Connect
        window.tonConnect.init();
        
        this.bindEvents();
        this.loadBalance();
    }

    bindEvents() {
        document.getElementById('connectWallet').addEventListener('click', () => {
            window.tonConnect.connectWallet();
        });

        document.getElementById('disconnectWallet').addEventListener('click', () => {
            window.tonConnect.disconnectWallet();
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
            window.tonConnect.showStatus('Минимальная сумма депозита: 0.1 TON', 'error');
            return;
        }

        if (!window.tonConnect.connected) {
            window.tonConnect.showStatus('Подключите кошелек сначала', 'error');
            return;
        }

        try {
            // Здесь будет логика отправки TON на контракт
            const result = await fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId, amount: amount })
            });

            const data = await result.json();
            if (data.success) {
                window.tonConnect.showStatus(`Депозит ${amount} TON успешен!`, 'success');
                this.loadBalance();
                document.getElementById('depositAmount').value = '';
            }
        } catch (error) {
            window.tonConnect.showStatus('Ошибка депозита', 'error');
        }
    }

    async handleWithdraw() {
        const amount = document.getElementById('withdrawAmount').value;
        if (!amount || amount < 0.1) {
            window.tonConnect.showStatus('Минимальная сумма вывода: 0.1 TON', 'error');
            return;
        }

        try {
            const result = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId, amount: amount })
            });

            const data = await result.json();
            if (data.success) {
                window.tonConnect.showStatus(`Вывод ${amount} TON успешен!`, 'success');
                this.loadBalance();
                document.getElementById('withdrawAmount').value = '';
            } else {
                window.tonConnect.showStatus(data.error, 'error');
            }
        } catch (error) {
            window.tonConnect.showStatus('Ошибка вывода', 'error');
        }
    }

    async loadBalance() {
        if (!this.userId) return;
        
        try {
            const result = await fetch(`/api/balance/${this.userId}`);
            const data = await result.json();
            document.getElementById('balance').textContent = data.balance + ' TON';
        } catch (error) {
            console.error('Load balance error:', error);
        }
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new WalletApp();
});