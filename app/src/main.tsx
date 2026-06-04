import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Toaster } from './components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { env } from './config/env'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={env.google.clientId}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </GoogleOAuthProvider>
  </StrictMode>,
)
