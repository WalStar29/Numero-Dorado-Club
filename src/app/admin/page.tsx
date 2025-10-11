'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'
import Navbar from '@/components/Navbar'
import '@/styles/admin.css'

export default function AdminPage() {
    const [autorizado, setAutorizado] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const acceso = localStorage.getItem('admin')
        if (acceso === 'true') {
        setAutorizado(true)
        } else {
        router.push('/login')
        }
    }, [router])

    if (!autorizado) return null

    return (
        <>
        <Navbar />
        <div className="admin-panel-container">
            <h2 className="admin-title">Panel de Administración</h2>
            <AdminPanel />
        </div>
        </>
    )
}
