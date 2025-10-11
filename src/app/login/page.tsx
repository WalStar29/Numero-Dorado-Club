'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import '@/styles/admin.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@dorado.com' && password === '123456') {
      localStorage.setItem('admin', 'true')
      router.push('/admin')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <>
      <Navbar />
      <div className="admin-panel-container">
        <h2 className="admin-title">Acceso Administrador</h2>
        <form onSubmit={handleLogin} className="admin-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            required
          />
          <button type="submit" className="admin-button">Iniciar sesión</button>
          {error && <p className="admin-error">{error}</p>}
        </form>
      </div>
    </>
  )
}
