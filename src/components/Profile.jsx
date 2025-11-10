import React, { useEffect, useState } from 'react'
import WalletConnect from './WalletConnect'
import GameMenu from './GameMenu'
import '../styles/Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand()
      const userData = tg.initDataUnsafe?.user
      setUser(userData)
    }
  }, [])

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

      {/* Кнопка пополнения */}
      <button className="deposit-btn">
        <span className="btn-icon">💎</span>
        Пополнить баланс
      </button>

      {/* Подключение кошелька */}
      <WalletConnect />

      {/* Меню игр */}
      <GameMenu />
    </div>
  )
}

export default Profile