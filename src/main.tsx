import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './app/globals.css'
import { loadBundle } from './services/api'

const render = () =>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

// Wait briefly for CMS content so visitors never see stale default copy flash and swap.
// The bundle is edge-cached, so this is usually a few milliseconds; the admin panel skips it.
if (window.location.pathname.startsWith('/admin')) render()
else Promise.race([loadBundle(), new Promise((r) => setTimeout(r, 2500))]).finally(render)
