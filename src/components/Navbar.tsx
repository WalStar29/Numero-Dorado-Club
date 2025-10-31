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
        <nav className={`navbar ${menuAbierto ? 'menu-activo' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="/loaders.svg" alt="Logo Número Dorado Club" className="logo-img" />
                </div>

                {/* Redes sociales visibles en escritorio */}
                <div className="navbar-social-desktop">
                    <a href="#" className="navbar-icon-item">
                        <img src="/youtube.svg" alt="YouTube" className="navbar-icon" />
                    </a>
                    <a href="https://wa.me/584223939612" target="_blank" className="navbar-icon-item">
                        <img src="/what.svg" alt="WhatsApp" className="navbar-icon" />
                    </a>
                    <a href="https://www.instagram.com/numerodoradoclub?igsh=MWg5cmhhZmU3ZDk5YQ==" target="_blank" className="navbar-icon-item">
                        <img src="/insta.svg" alt="Instagram" className="navbar-icon" />
                    </a>
                    <a href="https://drive.google.com/file/d/1hfZQDUEEQcy2R6PJ9u_RDIKYRpLbBL9V/view?usp=drive_link" target="_blank" className="navbar-icon-item">
                        <img src="/drive.svg" alt="google driver" className="navbar-icon" />
                    </a>
                </div>

                {/* Ícono hamburguesa solo en móvil */}
                <button className="navbar-menu-icon" onClick={() => setMenuAbierto(true)}>
                    <FaBars />
                </button>
            </div>

            {/* Sidebar móvil */}
            <div className={`navbar-sidebar ${menuAbierto ? 'activo' : ''}`}>
                <button className="navbar-close-icon" onClick={() => setMenuAbierto(false)}>
                    <FaTimes />
                </button>
                <div className="navbar-social-section">
                    <h3 className="navbar-social-title">Nuestras redes sociales</h3>
                    <div className="navbar-icon-links">
                        <a href="#" className="navbar-icon-item"><img src="/youtube.svg" alt="YouTube" className="navbar-icon" /><span>YouTube</span></a>
                        <a href="https://wa.me/584223939612" target="_blank" className="navbar-icon-item"><img src="/what.svg" alt="WhatsApp" className="navbar-icon" /><span>WhatsApp</span></a>
                        <a href="https://www.instagram.com/numerodoradoclub?igsh=MWg5cmhhZmU3ZDk5YQ==" target="_blank" className="navbar-icon-item"><img src="/insta.svg" alt="Instagram" className="navbar-icon" /><span>Instagram</span></a>
                        <a href="https://drive.google.com/file/d/1hfZQDUEEQcy2R6PJ9u_RDIKYRpLbBL9V/view?usp=drive_link" target="_blank" className="navbar-icon-item"><img src="/drive.svg" alt="googlge driver" className="navbar-icon" /><span>Terminos y Condiciones</span></a>
                    </div>
                </div>
            </div>

            {menuAbierto && <div className="navbar-overlay" />}
        </nav>
    )
}
