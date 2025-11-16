// app/checkout/walter/page.tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Page from '../page' // 👈 checkout base

export default function WalterCheckout() {
    const pathname = usePathname()

    useEffect(() => {
        // Guarda el origen según la ruta real
        localStorage.setItem('origenEnlace', pathname || '/')
    }, [pathname])

    return <Page />
}
