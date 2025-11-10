import React, { useEffect, useState } from 'react'
import WalletConnect from './WalletConnect'
import GameMenu from './GameMenu'
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
      setBalance(125.50) // тестовый баланс
    }
  }, [])

  return (
    <div className="profile">
      <div className="profile-header">
        {user?.photo_url && (
          <img src={user.photo_url} alt="Avatar" className="profile-avatar" />
        )}
        <div className="profile-info">
          <h2>{user?.first_name || 'Игрок'}</h2>
          <div className="balance-section">
            <span className="balance-label">Баланс</span>
            <span className="balance-amount">{balance} TON</span>
          </div>
        </div>
      </div>

      <button className="deposit-btn">
        <span className="btn-icon">💎</span>
        Пополнить баланс
      </button>

      <WalletConnect />
      <GameMenu />
    </div>
  )
}

export default Profile