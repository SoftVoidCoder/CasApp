class TONConnectManager {
    constructor() {
        this.connector = null;
        this.walletInfo = null;
        this.manifestUrl = 'https://your-app-url.com/tonconnect-manifest.json';
        
        this.init();
    }

    async init() {
        // Initialize TON Connect
        this.connector = new TONConnectSDK.TonConnect({ manifestUrl: this.manifestUrl });
        
        // Check if wallet is already connected
        await this.checkConnection();
        
        // Subscribe to connection status changes
        this.connector.onStatusChange(wallet => {
            this.handleWalletChange(wallet);
        });
    }

    async checkConnection() {
        try {
            if (this.connector.connected) {
                this.walletInfo = this.connector.wallet;
                this.handleWalletChange(this.walletInfo);
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    }

    handleWalletChange(wallet) {
        if (wallet) {
            this.walletInfo = wallet;
            this.onWalletConnected(wallet);
        } else {
            this.walletInfo = null;
            this.onWalletDisconnected();
        }
    }

    async connectWallet() {
        try {
            const connectionSource = await this.connector.connectWallet();
            return connectionSource;
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    async disconnectWallet() {
        try {
            await this.connector.disconnect();
            this.walletInfo = null;
            this.onWalletDisconnected();
        } catch (error) {
            console.error('Disconnection error:', error);
            throw error;
        }
    }

    async sendTransaction(transaction) {
        if (!this.connector.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            const result = await this.connector.sendTransaction(transaction);
            return result;
        } catch (error) {
            console.error('Transaction error:', error);
            throw error;
        }
    }

    onWalletConnected(wallet) {
        // This will be implemented in app.js
        if (window.onWalletConnected) {
            window.onWalletConnected(wallet);
        }
    }

    onWalletDisconnected() {
        // This will be implemented in app.js
        if (window.onWalletDisconnected) {
            window.onWalletDisconnected();
        }
    }

    getWalletAddress() {
        return this.walletInfo ? this.walletInfo.account.address : null;
    }

    isConnected() {
        return this.connector.connected;
    }
}

// Initialize TON Connect Manager
let tonConnectManager;

document.addEventListener('DOMContentLoaded', function() {
    tonConnectManager = new TONConnectManager();
});