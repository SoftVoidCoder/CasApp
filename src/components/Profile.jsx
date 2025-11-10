import React, { useEffect, useState } from 'react'
import '../styles/Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand()
      const userData = tg.initDataUnsafe?.user
      setUser(userData)
      // Заглушка баланса
      setBalance(1000)
    }
  }, [])

  const handleDeposit = () => {
    // Логика пополнения
    console.log('Deposit clicked')
  }

  const handleWithdraw = () => {
    // Логика вывода
    console.log('Withdraw clicked')
  }

  return (
    <div className="profile">
      {/* Шапка профиля */}
      <div className="profile-header">
        {user?.photo_url && (
          <img src={user.photo_url} alt="Avatar" className="profile-avatar" />
        )}
        <div className="profile-info">
          <h2>{user?.first_name || 'Игрок'}</h2>
          <p className="profile-id">ID: {user?.id || '0000'}</p>
        </div>
      </div>

      {/* Баланс */}
      <div className="balance-section">
        <div className="balance-label">Ваш баланс</div>
        <div className="balance-amount">{balance} ₽</div>
      </div>

      {/* Кнопки действий */}
      <div className="actions-section">
        <button className="btn btn-deposit" onClick={handleDeposit}>
          <span>💎</span>
          Пополнить
        </button>
        <button className="btn btn-withdraw" onClick={handleWithdraw}>
          <span>📤</span>
          Вывести
        </button>
      </div>

      {/* Меню игр */}
      <div className="game-menu">
        <h3>Игры</h3>
        <div className="games-grid">
          <div className="game-card">
            <div className="game-icon">💣</div>
            <span className="game-name">Mines</span>
          </div>
          <div className="game-card">
            <div className="game-icon">📈</div>
            <span className="game-name">Crash</span>
          </div>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <div className="nav-icon">👤</div>
          <div className="nav-label">Профиль</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon">🎮</div>
          <div className="nav-label">Игры</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon">📊</div>
          <div className="nav-label">Статистика</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon">⚙️</div>
          <div className="nav-label">Настройки</div>
        </div>
      </div>
    </div>
  )
}

export default Profile