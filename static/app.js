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

            this.initTONConnect();
            this.updateUserProfile();
            this.updateUI();
            this.showApp();
            
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
        }
    }

    async initTONConnect() {
        // Инициализируем TON Connect
        this.tonConnect = new TonConnectSDK.TonConnect({
            manifestUrl: window.location.origin + '/tonconnect-manifest.json'
        });

        // Восстанавливаем соединение если было
        if (await this.tonConnect.connected) {
            this.updateWalletInfo();
        }

        // Слушаем изменения подключения
        this.tonConnect.onStatusChange(wallet => {
            if (wallet) {
                this.updateWalletInfo();
            } else {
                this.disconnectWallet();
            }
        });
    }

    async connectWallet() {
        try {
            const walletsList = await this.tonConnect.getWallets();
            
            if (walletsList.length === 0) {
                this.showMessage('No TON wallets available', 'error');
                return;
            }

            // Показываем модалку с выбором кошельков
            this.showWalletSelectionModal(walletsList);
            
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
        }
    }

    showWalletSelectionModal(walletsList) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Connect TON Wallet</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Choose your wallet to connect:</p>
                    <div class="wallets-list">
                        ${walletsList.map(wallet => `
                            <div class="wallet-item" onclick="window.app.connectToWallet('${wallet.appName}')">
                                <img src="${wallet.imageUrl}" alt="${wallet.name}" onerror="this.src='https://via.placeholder.com/32'">
                                <div class="wallet-info">
                                    <span class="wallet-name">${wallet.name}</span>
                                    <span class="wallet-type">${wallet.about}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async connectToWallet(appName) {
        try {
            // Закрываем модалку
            document.querySelector('.modal-overlay')?.remove();
            
            const walletInfo = await this.tonConnect.getWallets();
            const wallet = walletInfo.find(w => w.appName === appName);
            
            if (wallet) {
                // Подключаемся к кошельку
                await this.tonConnect.connect({ jsBridgeKey: wallet.jsBridgeKey });
                this.showMessage('Wallet connected successfully!', 'success');
            }
        } catch (error) {
            this.showMessage('Connection failed: ' + error.message, 'error');
        }
    }

    async updateWalletInfo() {
        if (this.tonConnect.connected && this.tonConnect.account) {
            const address = this.tonConnect.account.address;
            await this.saveWalletAddress(address);
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
                this.showMessage('Wallet address saved!', 'success');
            }
        } catch (error) {
            console.error('Error saving wallet address:', error);
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
            // Сокращаем адрес для красоты
            const shortAddress = this.currentUser.wallet_address.slice(0, 8) + '...' + this.currentUser.wallet_address.slice(-8);
            walletAddress.textContent = shortAddress;
            walletAddress.title = this.currentUser.wallet_address; // полный адрес при наведении
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
        document.getElementById('depositAmount').focus();
    }

    hideDepositForm() {
        document.getElementById('depositModal').classList.add('hidden');
        document.getElementById('depositAmount').value = '';
    }

    async submitDeposit() {
        // Пока заглушка - потом добавим реальные платежи
        const amount = parseFloat(document.getElementById('depositAmount').value);

        if (!amount || amount <= 0) {
            this.showMessage('Please enter valid amount', 'error');
            return;
        }

        this.showMessage('Deposit functionality coming soon!', 'info');
        this.hideDepositForm();
    }

    showMessage(text, type = 'info') {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        container.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
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
script.src = 'https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js';
script.onload = () => {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new TelegramWalletApp();
    });
};
document.head.appendChild(script);