// Подключение TON Connect
import { TonConnectUI } from 'https://unpkg.com/@tonconnect/ui@2.1.0/dist/tonconnect-ui.min.js';

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://softvoidcoder.github.io/CasApp/tonconnect-manifest.json',
});

document.getElementById('tonconnect-button').append(tonConnectUI.button);

window.tonConnectUI = tonConnectUI;

// Сохраняем адрес при подключении
tonConnectUI.onStatusChange((wallet) => {
  if (wallet) {
    window.currentWalletAddress = wallet.account.address;
    document.getElementById('actions').classList.remove('hidden');
    if (window.fetchBalance) {
      fetchBalance(wallet.account.address);
    }
  } else {
    document.getElementById('actions').classList.add('hidden');
    window.currentWalletAddress = null;
  }
});
