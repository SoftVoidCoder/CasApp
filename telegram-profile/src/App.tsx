// src/App.tsx
import { useEffect, useState } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance] = useState<string>('12.56 TON'); // Пример баланса

  useEffect(() => {
    if ('Telegram' in window) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe.user;

      if (user) {
        setUser(user as User);
      }
    }
  }, []);

  const getFullName = () => {
    if (!user) return 'Неизвестно';
    return `${user.first_name} ${user.last_name || ''}`.trim();
  };

  return (
    <div style={styles.container}>
      {/* Аватар и имя */}
      <div style={styles.profileHeader}>
        <img
          src={user?.photo_url || 'https://via.placeholder.com/80'}
          alt="Аватар"
          style={styles.avatar}
        />
        <h2 style={styles.name}>{getFullName()}</h2>
        {user?.username && <p style={styles.username}>@{user.username}</p>}
      </div>

      {/* Баланс */}
      <div style={styles.balanceCard}>
        <p style={styles.balanceLabel}>Ваш баланс</p>
        <p style={styles.balanceValue}>{balance}</p>
      </div>

      {/* Доп. информация */}
      <div style={styles.infoCard}>
        <p>ID: <span style={styles.infoText}>{user?.id || '—'}</span></p>
      </div>
    </div>
  );
};

// Стили в объектах (подходит для React)
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
    color: '#fff',
    backgroundColor: '#000',
    minHeight: '100vh',
  },
  profileHeader: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid #009688',
    objectFit: 'cover' as const,
  },
  name: {
    marginTop: '12px',
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  username: {
    color: '#009688',
    fontSize: '1rem',
    marginTop: '4px',
  },
  balanceCard: {
    backgroundColor: '#111',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  balanceLabel: {
    fontSize: '0.9rem',
    color: '#888',
  },
  balanceValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#009688',
    margin: '8px 0 0',
  },
  infoCard: {
    backgroundColor: '#111',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#aaa',
  },
  infoText: {
    color: '#fff',
    fontWeight: '500',
  },
};

export default App;
