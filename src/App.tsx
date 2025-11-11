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
  const [balance] = useState<string>('12.56 TON');

  useEffect(() => {
    if ('Telegram' in window) {
      const tg = window.Telegram.WebApp;
      const userData = tg.initDataUnsafe.user;

      if (userData) {
        setUser(userData as User);
      }
    } else {
      // Заглушка для разработки
      setUser({
        id: 123456789,
        first_name: 'Иван',
        last_name: 'Телеграмов',
        username: 'ivantele',
        photo_url: 'https://via.placeholder.com/80/009688/FFFFFF?text=ИТ',
      });
    }
  }, []);

  const getFullName = () => {
    if (!user) return 'Неизвестно';
    return `${user.first_name} ${user.last_name || ''}`.trim();
  };

  return (
    <div style={styles.container}>
      <div style={styles.profileHeader}>
        <img
          src={user?.photo_url || 'https://via.placeholder.com/80'}
          alt="Аватар"
          style={styles.avatar}
        />
        <h2 style={styles.name}>{getFullName()}</h2>
        {user?.username && <p style={styles.username}>@{user.username}</p>}
      </div>

      <div style={styles.balanceCard}>
        <p style={styles.balanceLabel}>Баланс</p>
        <p style={styles.balanceValue}>{balance}</p>
      </div>

      <div style={styles.infoCard}>
        <p>ID: <span style={styles.infoText}>{user?.id}</span></p>
      </div>
    </div>
  );
};

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
    margin: '40px 0 20px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid #009688',
    objectFit: 'cover' as const,
  },
  name: {
    margin: '12px 0 4px',
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  username: {
    color: '#009688',
    fontSize: '1rem',
    margin: 0,
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
