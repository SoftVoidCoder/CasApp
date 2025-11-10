class TelegramWalletApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.API_BASE = window.location.origin + '/api';
        this.currentUser = null;
        this.tonConnect = null;
        
        this.init();
    }

    async init() {
        try {
            this.tg.expand();
            this.tg.ready();
            
            const initData = this.tg.initDataUnsafe;
            const user = initData.user;
            
            if (!user) {
                throw new Error('User data not available');
            }

            this.currentUser = await this.createOrGetUser({
                telegram_id: user.id.toString(),
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            });

            // Инициализируем TON Connect
            this.initTONConnect();
            
            this.updateUserProfile();
            this.updateUI();
            this.showApp();
            
        } catch (error) {
            console.error('Init error:', error);
            this.showApp();
        }
    }

    initTONConnect() {
        // Создаем манифест для TON Connect
        const manifest = {
            url: window.location.origin,
            name: 'Wallet App',
            iconUrl: window.location.origin + '/static/icon.png'
        };

        // Инициализируем TON Connect
        this.tonConnect = new TonConnect({
            manifest: manifest
        });

        // Восстанавливаем соединение если было
        const restoredConnection = this.tonConnect.restoreConnection();
        if (restoredConnection) {
            this.onWalletConnected(restoredConnection);
        }
    }

    async connectWallet() {
        try {
            // Получаем список доступных кошельков
            const walletsList = await this.tonConnect.getWallets();
            
            // Показываем модалку с выбором кошельков
            this.showWalletsModal(walletsList);
            
        } catch (error) {
            this.showMessage('Error loading wallets: ' + error.message, 'error');
        }
    }

    showWalletsModal(walletsList) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Connect TON Wallet</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="wallets-list">
                        ${walletsList.map(wallet => `
                            <div class="wallet-item" onclick="window.app.connectToWallet('${wallet.name}')">
                                <img src="${wallet.imageUrl}" alt="${wallet.name}">
                                <div class="wallet-info">
                                    <span class="wallet-name">${wallet.name}</span>
                                    <span class="wallet-about">${wallet.about || 'TON Wallet'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async connectToWallet(walletName) {
        try {
            document.querySelector('.modal-overlay')?.remove();
            
            // Подключаемся к выбранному кошельку
            const connection = await this.tonConnect.connect(walletName);
            this.onWalletConnected(connection);
            
        } catch (error) {
            this.showMessage('Connection failed: ' + error.message, 'error');
        }
    }

    onWalletConnected(connection) {
        if (connection && connection.account) {
            const walletAddress = connection.account.address;
            this.saveWalletAddress(walletAddress);
            this.showMessage('TON wallet connected successfully!', 'success');
        }
    }

    async saveWalletAddress(address) {
        try {
            const response = await fetch(
                `${this.API_BASE}/users/${this.currentUser.telegram_id}/wallet`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wallet_address: address
                    })
                }
            );

            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error saving wallet:', error);
        }
    }

    async disconnectWallet() {
        try {
            await this.tonConnect.disconnect();
            
            const response = await fetch(
                `${this.API_BASE}/users/${this.currentUser.telegram_id}/wallet`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wallet_address: null
                    })
                }
            );

            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUI();
                this.showMessage('Wallet disconnected!', 'success');
            }
        } catch (error) {
            this.showMessage('Error disconnecting wallet', 'error');
        }
    }

    async createOrGetUser(userData) {
        const response = await fetch(`${this.API_BASE}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        
        return await response.json();
    }

    updateUserProfile() {
        const initData = this.tg.initDataUnsafe;
        const user = initData.user;
        
        document.getElementById('userName').textContent = 
            [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User';
        document.getElementById('userUsername').textContent = 
            user.username ? `@${user.username}` : '';
    }

    updateUI() {
        if (!this.currentUser) return;
        
        document.getElementById('balance').textContent = 
            `$${this.currentUser.balance.toFixed(2)}`;
        
        const walletSection = document.getElementById('walletSection');
        const walletAddress = document.getElementById('walletAddress');
        
        if (this.currentUser.wallet_address) {
            walletSection.style.display = 'block';
            // Сокращаем адрес для отображения
            const shortAddr = this.currentUser.wallet_address.slice(0, 8) + '...' + this.currentUser.wallet_address.slice(-8);
            walletAddress.textContent = shortAddr;
            walletAddress.title = this.currentUser.wallet_address; // полный адрес в tooltip
        } else {
            walletSection.style.display = 'none';
        }
    }

    showApp() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    showDepositForm() {
        if (!this.currentUser.wallet_address) {
            this.showMessage('Please connect wallet first', 'error');
            return;
        }
        document.getElementById('depositModal').classList.remove('hidden');
    }

    hideDepositForm() {
        document.getElementById('depositModal').classList.add('hidden');
    }

    async submitDeposit() {
        const amount = parseFloat(document.getElementById('depositAmount').value);

        if (!amount || amount <= 0) {
            this.showMessage('Enter valid amount', 'error');
            return;
        }

        try {
            const response = await fetch(
                `${this.API_BASE}/users/${this.currentUser.telegram_id}/deposit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount,
                        description: 'Deposit'
                    })
                }
            );

            if (response.ok) {
                const result = await response.json();
                this.currentUser.balance = result.new_balance;
                this.updateUI();
                this.hideDepositForm();
                this.showMessage(`Deposit $${amount} successful!`, 'success');
            }
        } catch (error) {
            this.showMessage('Deposit failed', 'error');
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = type;
        setTimeout(() => messageEl.textContent = '', 3000);
    }
}

// Глобальные функции
function showDepositForm() {
    window.app.showDepositForm();
}

function hideDepositForm() {
    window.app.hideDepositForm();
}

function connectWallet() {
    window.app.connectWallet();
}

function disconnectWallet() {
    window.app.disconnectWallet();
}

function submitDeposit() {
    window.app.submitDeposit();
}

// Загружаем TON Connect SDK
const script = document.createElement('script');
script.src = 'https://unpkg.com/tonconnect-sdk@latest/dist/tonconnect-sdk.min.js';
document.head.appendChild(script);

// Запускаем app после загрузки SDK
script.onload = () => {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new TelegramWalletApp();
    });
};