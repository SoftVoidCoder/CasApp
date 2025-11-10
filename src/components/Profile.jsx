import React, { useEffect, useState, useMemo } from 'react'
import '../styles/Profile.css'

/* Встроенный компонент подключения кошелька (без отдельных файлов) */
function WalletConnectInline() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    tg?.ready?.()
  }, [])

  const short = useMemo(() => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [address])

  const onConnect = async () => {
    try {
      // Попробуем открыть TonConnect UI, если библиотека загружена
      const u = window.TonConnectUI || window.tonConnectUI || null
      if (u && typeof u.openModal === 'function') {
        await u.openModal()
      }
      // Для макета — просто имитируем подключение
      setConnected(true)
      setAddress('EQBf...TONX')
    } catch (e) {
      setConnected(true)
      setAddress('EQBf...TONX')
    }
  }

  const onDisconnect = () => {
    setConnected(false)
    setAddress('')
  }

  return connected ? (
    <button className="wallet-btn" onClick={onDisconnect}>
      <span className="btn-icon">🔌</span> Отключить кошелёк ({short})
    </button>
  ) : (
    <button className="wallet-btn" onClick={onConnect}>
      <span className="btn-icon">💳</span> Подключить кошелёк
    </button>
  )
}

/* Меню игр — только требуемые пункты */
function GameMenuInline({ onOpen }) {
  const items = [
    { name: 'Профиль', icon: '👤' },
    { name: 'Краш', icon: '📈' },
    { name: 'Монетка', icon: '🪙' },
    { name: 'Мины', icon: '💣' },
  ]
  return (
    <>
      <div className="section-title">Меню игр</div>
      <div className="games-grid">
        {items.map((it) => (
          <div key={it.name} className="game-card" onClick={() => onOpen?.(it.name)}>
            <div className="game-icon">{it.icon}</div>
            <div className="game-name">{it.name}</div>
          </div>
        ))}
      </div>
    </>
  )
}

const Profile = () => {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand?.()
      tg.ready?.()
      const userData = tg.initDataUnsafe?.user
      setUser(userData)
    }
  }, [])

  const name = user?.first_name || 'Игрок'
  const userId = user?.id || '0000'
  const photo = user?.photo_url || ''

  const onDeposit = () => {
    // здесь будет логика депозита
    console.log('deposit')
  }

  return (
    <div className="profile">
      <div className="profile-header">
        {photo ? (
          <img src={photo} alt="Avatar" className="profile-avatar" />
        ) : (
          <img
            src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
            alt="Avatar"
            className="profile-avatar"
          />
        )}
        <div className="profile-info">
          <h2>{name}</h2>
          <p className="profile-id">ID: {userId}</p>
        </div>

        <div className="balance-badge" title="Баланс">
          <span className="balance-diamond">💎</span>
          <span>{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="controls-card">
        <button className="deposit-btn" onClick={onDeposit}>
          <span className="btn-icon">💎</span>
          Пополнить баланс
        </button>

        <WalletConnectInline />
      </div>

      <GameMenuInline onOpen={(name) => console.log('open:', name)} />
    </div>
  )
}

export default Profile