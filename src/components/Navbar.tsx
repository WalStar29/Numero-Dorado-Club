'use client'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import '@/styles/Navbar.css'

export default function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false)

    useEffect(() => {
        document.body.style.overflow = menuAbierto ? 'hidden' : 'auto'
        return () => {
        document.body.style.overflow = 'auto'
        }
    }, [menuAbierto])

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="/loaders.svg" alt="Logo Número Dorado Club" className="logo-img" />
                </div>

                {/* Ícono hamburguesa */}
                <button className="navbar-menu-icon" onClick={() => setMenuAbierto(true)}>
                <FaBars />
                </button>
            </div>

            {/* Menú lateral móvil */}
            <div className={`navbar-sidebar ${menuAbierto ? 'activo' : ''}`}>
                <button className="navbar-close-icon" onClick={() => setMenuAbierto(false)}>
                <FaTimes />
                </button>
            </div>

            {/* Fondo oscuro sin interacción */}
            {menuAbierto && <div className="navbar-overlay" />}
        </nav>
    )
}
