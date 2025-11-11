// src/index.tsx
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Инициализация Telegram WebApp
if ('telegram' in window) {
  const tg = window.Telegram.WebApp;
  tg.ready(); // Говорим, что приложение готово
  tg.expand(); // Расширяем на весь экран
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
