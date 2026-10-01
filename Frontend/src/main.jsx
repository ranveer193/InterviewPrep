import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './firebase.js'
import App from './App.jsx'
import { AuthProvider } from "./context/authContext.jsx"
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <AuthProvider>
  <ToastContainer/>
    <App />
  </AuthProvider>
  </StrictMode>,
)
