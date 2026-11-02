import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './css/home.css'
import './css/shop.css'
import './css/commerce.css'
import './css/admin.css'
import './motion.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
