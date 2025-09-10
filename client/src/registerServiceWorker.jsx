// src/registerServiceWorker.jsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function RegisterServiceWorker() {
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    onRegistered(swReg) {
      console.log('Service Worker Registered:', swReg)
    },
    onRegisterError(error) {
      console.error('Service Worker Error:', error)
    }
  })

  return (
    <div>
      {offlineReady && <p>✅ App ready to work offline!</p>}
      {needRefresh && (
        <button onClick={() => updateServiceWorker(true)}>
          🔄 Update available – Click to refresh
        </button>
      )}
    </div>
  )
}
