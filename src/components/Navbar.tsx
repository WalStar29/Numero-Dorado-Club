'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaBars, FaTimes } from 'react-icons/fa'
import '@/styles/Navbar.css'

export default function Navbar() {
    const router = useRouter()
    const [menuAbierto, setMenuAbierto] = useState(false)

    const irAdmin = () => {
        router.push('/login')
        setMenuAbierto(false)
    }

    useEffect(() => {
        if (menuAbierto) {
        document.body.style.overflow = 'hidden'
        } else {
        document.body.style.overflow = 'auto'
        }

        return () => {
        document.body.style.overflow = 'auto'
        }
    }, [menuAbierto])

    return (
        <nav className="navbar">
        <div className="navbar-container">
            <div className="navbar-logo">
                <img src="/logo.png" alt="Logo Número Dorado Club" className="logo-img" />
                <span>NUMERO DORADO CLUB</span>
            </div>

            {/* Ícono hamburguesa */}
            <button className="navbar-menu-icon" onClick={() => setMenuAbierto(true)}>
                <FaBars />
            </button>

            {/* Botones desktop */}
            <div className="navbar-buttons desktop-only">
                <button onClick={irAdmin} className="navbar-button">Admin</button>
            </div>
        </div>

        {/* Menú lateral móvil */}
        <div className={`navbar-sidebar ${menuAbierto ? 'activo' : ''}`}>
            <button className="navbar-close-icon" onClick={() => setMenuAbierto(false)}>
                <FaTimes />
            </button>
            <button onClick={irAdmin} className="navbar-button">Admin</button>
        </div>

        {/* Fondo oscuro sin interacción */}
        {menuAbierto && <div className="navbar-overlay" />}
        </nav>
    )
}
