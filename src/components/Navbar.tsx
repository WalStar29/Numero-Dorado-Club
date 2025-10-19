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
                <button className="navbar-menu-icon" onClick={() => setMenuAbierto(true)}>
                    <FaBars />
                </button>
            </div>

            <div className={`navbar-sidebar ${menuAbierto ? 'activo' : ''}`}>
                <button className="navbar-close-icon" onClick={() => setMenuAbierto(false)}>
                    <FaTimes />
                </button>
                <div className="navbar-social-section">
                    <h3 className="navbar-social-title">Nuestras redes sociales</h3>
                    <div className="navbar-icon-links">
                        <a href="#" className="navbar-icon-item">
                            <img src="/youtube.svg" alt="YouTube" className="navbar-icon" />
                            <span>YouTube</span>
                        </a>
                        <a  href="https://wa.me/584223939612" target="_blank" className="navbar-icon-item">
                            <img src="/what.svg" alt="WhatsApp" className="navbar-icon" />
                            <span>WhatsApp</span>
                        </a>
                        <a href="https://www.instagram.com/numerodoradoclub?igsh=MWg5cmhhZmU3ZDk5YQ==" target="_blank" className="navbar-icon-item">
                            <img src="/insta.svg" alt="Instagram" className="navbar-icon" />
                            <span>Instagram</span>
                        </a>
                    </div>
                </div>
            </div>
            {menuAbierto && <div className="navbar-overlay" />}
        </nav>
    )
}
