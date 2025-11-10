class TelegramWalletApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.API_BASE = window.location.origin + '/api';
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        try {
            this.tg.expand();
            
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

            this.updateUserProfile();
            this.updateUI();
            this.showApp();
            
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
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
            walletAddress.textContent = this.currentUser.wallet_address;
        } else {
            walletSection.style.display = 'none';
        }
    }

    showApp() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    async connectWallet() {
        if (this.tg.WebAppTelegramWallet) {
            try {
                // Запрос доступа к кошельку
                const result = await this.tg.WebAppTelegramWallet.requestAccess();
                
                if (result && result.address) {
                    // Сохраняем адрес кошелька
                    const response = await fetch(
                        `${this.API_BASE}/users/${this.currentUser.telegram_id}/wallet`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                wallet_address: result.address
                            })
                        }
                    );

                    if (response.ok) {
                        this.currentUser = await response.json();
                        this.updateUI();
                        this.showMessage('Telegram Wallet connected successfully!', 'success');
                    }
                } else {
                    this.showMessage('Wallet access denied', 'error');
                }
            } catch (error) {
                this.showMessage('Error connecting Telegram Wallet: ' + error.message, 'error');
            }
        } else {
            this.showMessage('Telegram Wallet not available', 'error');
        }
    }

    async disconnectWallet() {
        try {
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

    showDepositForm() {
        if (!this.currentUser.wallet_address) {
            this.showMessage('Please connect Telegram Wallet first', 'error');
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
        const amount = parseFloat(document.getElementById('depositAmount').value);

        if (!amount || amount <= 0) {
            this.showMessage('Please enter valid amount', 'error');
            return;
        }

        if (!this.tg.WebAppTelegramWallet) {
            this.showMessage('Telegram Wallet not available', 'error');
            return;
        }

        try {
            // Создаем инвойс через Telegram Wallet
            const invoiceResult = await this.tg.WebAppTelegramWallet.createInvoice({
                amount: amount * 100, // в копейках/центах
                currency: 'USD',
                description: `Deposit of $${amount}`
            });

            if (invoiceResult && invoiceResult.invoice_id) {
                // Сохраняем депозит в базу после успешной оплаты
                const response = await fetch(
                    `${this.API_BASE}/users/${this.currentUser.telegram_id}/deposit`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: amount,
                            description: `Telegram Wallet deposit of $${amount}`
                        })
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    this.currentUser.balance = result.new_balance;
                    this.updateUI();
                    this.hideDepositForm();
                    this.showMessage(`Deposit of $${amount} successful!`, 'success');
                }
            }
        } catch (error) {
            this.showMessage('Payment failed: ' + error.message, 'error');
        }
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TelegramWalletApp();
});