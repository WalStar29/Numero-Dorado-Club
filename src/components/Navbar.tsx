'use client'
import { useRouter } from 'next/navigation'
import '@/styles/Navbar.css'

export default function Navbar() {
    const router = useRouter()

    const irAdmin = () => {
        router.push('/login')
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="/logo.png" alt="Logo Número Dorado Club" className="logo-img" />
                    <span>NUMERO DORADO CLUB</span>
                </div>

                <div className="navbar-buttons">
                    <button onClick={irAdmin} className="navbar-button">
                        Admin
                    </button>
                </div>
            </div>
        </nav>
    )
}
