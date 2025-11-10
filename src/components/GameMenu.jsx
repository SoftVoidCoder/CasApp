import React from 'react'

const GameMenu = () => {
  const games = [
    { id: 'mines', name: 'Mines', icon: '💣', color: '#ff6b6b' },
    { id: 'crash', name: 'Crash', icon: '📈', color: '#4ecdc4' },
    { id: 'coinflip', name: 'Coin Flip', icon: '🪙', color: '#45b7d1' }
  ]

  return (
    <div className="game-menu">
      <h3>Игры</h3>
      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card" style={{ borderColor: game.color }}>
            <div className="game-icon" style={{ backgroundColor: game.color }}>
              {game.icon}
            </div>
            <span className="game-name">{game.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameMenu