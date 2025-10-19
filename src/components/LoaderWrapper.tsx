'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        const timeout = setTimeout(() => setLoading(false), 4000) // ⏱️ 4 segundos fijos
        return () => clearTimeout(timeout)
    }, [pathname])

    return (
        <>
        {loading && (
            <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#ffffffff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            color: '#5d4037',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease-in-out'
            }}>
            <Image
                src="/loaders.svg"
                alt="Logo Numero Dorado Club"
                width={100}
                height={100}
                style={{
                marginBottom: '20px',
                borderRadius: '16px',
                animation: 'float 2s ease-in-out infinite'
                }}
                priority
            />
            <div style={{
                width: '70px',
                height: '70px',
                border: '6px solid #ffdd00',
                borderTop: '6px solid #c9c9c9',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '20px'
            }} />
            <style>{`
                @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
                }
                @keyframes float {
                0% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
                100% { transform: translateY(0); }
                }
            `}</style>
            </div>
        )}
        {children}
        </>
    )
}
