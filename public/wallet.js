async function connectWallet() {
    if (window.Telegram && Telegram.WebApp) {
        try {
            const wallet = await Telegram.WebApp.sendData({
                method: 'ton_connect',
                params: {}
            });
            
            if (wallet && wallet.address) {
                const response = await fetch('/api/wallet/connect', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(wallet)
                });
                
                const result = await response.json();
                showWalletInfo(result);
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    }
}

function showWalletInfo(walletData) {
    document.getElementById('walletAddress').textContent = walletData.address;
    document.getElementById('walletBalance').textContent = walletData.balance;
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('balance').textContent = walletData.balance;
}