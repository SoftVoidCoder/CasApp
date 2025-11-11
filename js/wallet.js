class WalletManager {
    constructor() {
        this.balance = 0;
        this.transactions = [];
        this.userId = null;
        this.apiUrl = window.location.origin + '/api';
        
        this.loadUserData();
    }

    generateUserId() {
        if (window.Telegram && Telegram.WebApp) {
            const tgUser = Telegram.WebApp.initDataUnsafe.user;
            if (tgUser && tgUser.id) {
                return 'tg_' + tgUser.id;
            }
        }
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    async loadUserData() {
        this.userId = this.generateUserId();
        
        try {
            const response = await fetch(`${this.apiUrl}/user/${this.userId}`);
            if (response.ok) {
                const userData = await response.json();
                this.balance = userData.balance || 0;
                this.transactions = userData.transactions || [];
                this.updateUI();
            } else {
                await this.createUser();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            await this.createUser();
        }
    }

    async createUser() {
        try {
            const response = await fetch(`${this.apiUrl}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    balance: 0,
                    transactions: []
                })
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.balance = userData.balance;
                this.transactions = userData.transactions;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    async deposit(amount) {
        if (amount < 0.1) {
            throw new Error('Минимальная сумма депозита: 0.1 TON');
        }

        try {
            const response = await fetch(`${this.apiUrl}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    amount: amount
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка при пополнении');
            }

            const result = await response.json();
            this.balance = result.newBalance;
            this.transactions.unshift({
                type: 'deposit',
                amount: amount,
                date: new Date().toISOString(),
                hash: result.transactionHash
            });

            this.updateUI();
            this.showAlert('✅ Депозит успешно выполнен!', 'success');
            return result;
            
        } catch (error) {
            this.showAlert('❌ ' + error.message, 'error');
            throw error;
        }
    }

    async withdraw(amount) {
        if (amount < 0.1) {
            throw new Error('Минимальная сумма вывода: 0.1 TON');
        }

        if (amount > this.balance) {
            throw new Error('Недостаточно средств на балансе');
        }

        if (!tonConnectManager || !tonConnectManager.isConnected()) {
            throw new Error('Кошелек не подключен');
        }

        try {
            const response = await fetch(`${this.apiUrl}/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    amount: amount,
                    walletAddress: tonConnectManager.getWalletAddress()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка при выводе средств');
            }

            const result = await response.json();
            this.balance = result.newBalance;
            this.transactions.unshift({
                type: 'withdraw',
                amount: amount,
                date: new Date().toISOString(),
                hash: result.transactionHash
            });

            this.updateUI();
            this.showAlert('✅ Вывод средств выполнен успешно!', 'success');
            return result;
            
        } catch (error) {
            this.showAlert('❌ ' + error.message, 'error');
            throw error;
        }
    }

    updateUI() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `${this.balance.toFixed(2)} TON`;
        }
        this.updateTransactionsList();
    }

    updateTransactionsList() {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        if (this.transactions.length === 0) {
            transactionsList.innerHTML = '<div class="transaction-item">Нет операций</div>';
            return;
        }

        transactionsList.innerHTML = '';

        this.transactions.slice(0, 10).forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction-item`;
            
            const date = new Date(transaction.date).toLocaleDateString('ru-RU');
            const time = new Date(transaction.date).toLocaleTimeString('ru-RU');
            const amountClass = transaction.type === 'deposit' ? 'transaction-deposit' : 'transaction-withdraw';
            const amountSign = transaction.type === 'deposit' ? '+' : '-';
            const typeText = transaction.type === 'deposit' ? 'Пополнение' : 'Вывод';
            
            transactionElement.innerHTML = `
                <div>
                    <div>${typeText}</div>
                    <small>${date} ${time}</small>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountSign}${transaction.amount.toFixed(2)} TON
                </div>
            `;
            
            transactionsList.appendChild(transactionElement);
        });
    }

    showAlert(message, type) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    getBalance() {
        return this.balance;
    }

    getTransactions() {
        return this.transactions;
    }
}

let walletManager;

document.addEventListener('DOMContentLoaded', function() {
    walletManager = new WalletManager();
});