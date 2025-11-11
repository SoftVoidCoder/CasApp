class TonConnectService {
    constructor() {
        this.connector = null;
        this.wallet = null;
        this.connected = false;
    }

    async init() {
        try {
            // Инициализация TON Connect
            this.connector = new TonConnect({
                manifestUrl: window.location.origin + '/tonconnect.json'
            });
            
            // Проверка существующего подключения
            if (this.connector.connected) {
                this.wallet = this.connector.wallet;
                this.connected = true;
                this.onWalletConnected(this.wallet);
            }
            
            // Подписка на изменения подключения
            this.connector.onStatusChange(wallet => {
                if (wallet) {
                    this.wallet = wallet;
                    this.connected = true;
                    this.onWalletConnected(wallet);
                } else {
                    this.connected = false;
                    this.wallet = null;
                    this.onWalletDisconnected();
                }
            });
            
        } catch (error) {
            console.error('TON Connect init error:', error);
        }
    }

    async connectWallet() {
        try {
            const walletsList = await this.connector.getWallets();
            if (walletsList.length === 0) {
                throw new Error('No TON wallets found');
            }
            
            // Подключение к первому доступному кошельку
            await this.connector.connect(walletsList[0]);
            
        } catch (error) {
            console.error('Connect wallet error:', error);
            this.showStatus('Ошибка подключения кошелька', 'error');
        }
    }

    async disconnectWallet() {
        try {
            await this.connector.disconnect();
        } catch (error) {
            console.error('Disconnect wallet error:', error);
        }
    }

    async sendTransaction(to, amount, payload = '') {
        try {
            const transaction = {
                validUntil: Date.now() + 1000000,
                messages: [
                    {
                        address: to,
                        amount: amount.toString(),
                        payload: payload
                    }
                ]
            };
            
            const result = await this.connector.sendTransaction(transaction);
            return result;
            
        } catch (error) {
            console.error('Send transaction error:', error);
            throw error;
        }
    }

    onWalletConnected(wallet) {
        document.getElementById('connectWallet').classList.add('hidden');
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('walletAddress').textContent = 
            wallet.account.address.slice(0, 8) + '...' + wallet.account.address.slice(-8);
    }

    onWalletDisconnected() {
        document.getElementById('connectWallet').classList.remove('hidden');
        document.getElementById('walletInfo').classList.add('hidden');
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

// Глобальный экземпляр
window.tonConnect = new TonConnectService();