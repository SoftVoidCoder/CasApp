import { createRoot } from 'react-dom/client';
import App from './App';

// Инициализация Telegram Mini App
if ('Telegram' in window) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

createRoot(document.getElementById('root')!).render(<App />);
