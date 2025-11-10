// TON Connect как в Fragment
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: window.location.origin + '/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-button'
});

// Слушаем подключение кошелька
tonConnectUI.onStatusChange(wallet => {
    if (wallet) {
        showWalletInfo(wallet);
    } else {
        document.getElementById('wallet-info').style.display = 'none';
    }
});

function showWalletInfo(wallet) {
    const address = wallet.account.address;
    document.getElementById('wallet-address').textContent = 
        address.slice(0, 8) + '...' + address.slice(-8);
    document.getElementById('wallet-info').style.display = 'block';
}

// Данные Telegram
const tg = window.Telegram.WebApp;
tg.expand();
const user = tg.initDataUnsafe?.user;
if (user) {
    document.getElementById('user-name').textContent = user.first_name || 'Игрок';
}