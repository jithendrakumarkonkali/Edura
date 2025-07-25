import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Edura from './Edura.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Edura />
  </StrictMode>,
)
