// app/walter/page.tsx
'use client'
import { useEffect } from 'react'
import Home from '../page' // reutilizas la home

export default function WalterHome() {
    useEffect(() => {
        localStorage.setItem('origenEnlace', '/aamavid')
    }, [])

    return <Home />
}
