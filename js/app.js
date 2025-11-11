class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.setupTelegramUser();
        }

        this.setupEventListeners();
    }

    setupTelegramUser() {
        const user = this.tg.initDataUnsafe?.user;
        
        if (user) {
            const userNameElement = document.getElementById('userName');
            const userPhotoElement = document.getElementById('userPhoto');
            
            if (userNameElement) {
                userNameElement.textContent = user.first_name || 'User';
            }
            
            if (userPhotoElement && user.photo_url) {
                userPhotoElement.src = user.photo_url;
            }
        }
    }

    setupEventListeners() {
        // Wallet connection
        const connectBtn = document.getElementById('connectWalletBtn');
        const disconnectBtn = document.getElementById('disconnectWalletBtn');
        const depositBtn = document.getElementById('depositBtn');
        const withdrawBtn = document.getElementById('withdrawBtn');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }

        if (depositBtn) {
            depositBtn.addEventListener('click', () => this.processDeposit());
        }

        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.processWithdraw());
        }
    }

    async connectWallet() {
        try {
            const connectBtn = document.getElementById('connectWalletBtn');
            connectBtn.classList.add('loading');
            connectBtn.textContent = 'Подключение...';

            await tonConnectManager.connectWallet();
            
        } catch (error) {
            console.error('Connection failed:', error);
            walletManager.showAlert('Ошибка подключения кошелька', 'error');
        } finally {
            const connectBtn = document.getElementById('connectWalletBtn');
            connectBtn.classList.remove('loading');
        }
    }

    async disconnectWallet() {
        try {
            await tonConnectManager.disconnectWallet();
        } catch (error) {
            console.error('Disconnection failed:', error);
            walletManager.showAlert('Ошибка отключения кошелька', 'error');
        }
    }

    async processDeposit() {
        const amountInput = document.getElementById('depositAmount');
        const amount = parseFloat(amountInput.value);

        if (!amount || amount < 0.1) {
            walletManager.showAlert('Минимальная сумма депозита: 0.1 TON', 'error');
            return;
        }

        try {
            const depositBtn = document.getElementById('depositBtn');
            depositBtn.classList.add('loading');
            depositBtn.textContent = 'Обработка...';

            await walletManager.deposit(amount);
            amountInput.value = '';

        } catch (error) {
            console.error('Deposit failed:', error);
        } finally {
            const depositBtn = document.getElementById('depositBtn');
            depositBtn.classList.remove('loading');
            depositBtn.textContent = 'Пополнить';
        }
    }

    async processWithdraw() {
        const amountInput = document.getElementById('withdrawAmount');
        const amount = parseFloat(amountInput.value);

        if (!amount || amount < 0.1) {
            walletManager.showAlert('Минимальная сумма вывода: 0.1 TON', 'error');
            return;
        }

        try {
            const withdrawBtn = document.getElementById('withdrawBtn');
            withdrawBtn.classList.add('loading');
            withdrawBtn.textContent = 'Обработка...';

            await walletManager.withdraw(amount);
            amountInput.value = '';

        } catch (error) {
            console.error('Withdraw failed:', error);
        } finally {
            const withdrawBtn = document.getElementById('withdrawBtn');
            withdrawBtn.classList.remove('loading');
            withdrawBtn.textContent = 'Вывести';
        }
    }

    updateWalletUI(wallet) {
        const walletSection = document.getElementById('walletSection');
        const connectedWallet = document.getElementById('connectedWallet');
        const walletStatus = document.getElementById('walletStatus');
        const walletAddress = document.getElementById('walletAddress');
        const depositSection = document.getElementById('depositSection');
        const withdrawSection = document.getElementById('withdrawSection');
        const transactionsSection = document.getElementById('transactionsSection');

        if (wallet) {
            // Wallet connected
            walletSection.style.display = 'none';
            connectedWallet.style.display = 'block';
            depositSection.style.display = 'block';
            withdrawSection.style.display = 'block';
            transactionsSection.style.display = 'block';

            walletStatus.textContent = 'Кошелек подключен';
            walletStatus.className = 'wallet-status connected';
            
            const address = wallet.account.address;
            walletAddress.textContent = `${address.slice(0, 6)}...${address.slice(-6)}`;

        } else {
            // Wallet disconnected
            walletSection.style.display = 'block';
            connectedWallet.style.display = 'none';
            depositSection.style.display = 'none';
            withdrawSection.style.display = 'none';
            transactionsSection.style.display = 'none';

            walletStatus.textContent = 'Кошелек не подключен';
            walletStatus.className = 'wallet-status disconnected';
        }
    }
}

// Global functions for TON Connect callbacks
window.onWalletConnected = function(wallet) {
    const app = window.telegramApp;
    if (app) {
        app.updateWalletUI(wallet);
    }
};

window.onWalletDisconnected = function() {
    const app = window.telegramApp;
    if (app) {
        app.updateWalletUI(null);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.telegramApp = new TelegramApp();
});