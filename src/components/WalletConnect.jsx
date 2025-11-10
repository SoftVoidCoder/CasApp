import React, { useEffect } from 'react'

const WalletConnect = () => {
  useEffect(() => {
    const tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
      manifestUrl: window.location.origin + '/tonconnect-manifest.json',
      buttonRootId: 'ton-connect-button'
    })
  }, [])

  return (
    <div className="wallet-section">
      <div id="ton-connect-button"></div>
    </div>
  )
}

export default WalletConnect