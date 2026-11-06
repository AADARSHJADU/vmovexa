import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store'

// Clean up any stale or rogue service workers (e.g. sw.js from previous projects on this port)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL || '';
      if (scriptURL.endsWith('/sw.js') || (scriptURL.includes('sw.js') && !scriptURL.includes('firebase-messaging-sw.js'))) {
        registration.unregister().then((unregistered) => {
          if (unregistered) {
            console.info('[VMOVEXA] Automatically unregistered stale service worker:', scriptURL);
          }
        }).catch(() => {});
      }
    }
  }).catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
