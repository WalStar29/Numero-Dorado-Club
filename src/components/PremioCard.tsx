'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import '@/styles/PremioCard.css'

type TimeLeft = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

    export default function PremioCard() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    const drawDate = new Date('2025-11-01T20:00:00')

    useEffect(() => {
        const interval = setInterval(() => {
        const now = new Date()
        const diff = drawDate.getTime() - now.getTime()

        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
        const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24))
        const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60))
        const seconds = Math.max(0, Math.floor((diff / 1000) % 60))

        setTimeLeft({ days, hours, minutes, seconds })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="premio-card">
        <div className="badge-premio">
            Premio Principal <span>¡ACTIVA!</span>
        </div>

        <Image
            src="/iphone.jpg"
            alt="iPhone 15 Pro Max"
            width={400}
            height={300}
            className="premio-imagen"
            priority
        />

        <h2 className="premio-nombre">iPhone 15 Pro Max</h2>
        <p className="premio-descripcion">256GB – Titanio Natural</p>
        <p className="premio-valor">Valor: $1,200</p>

        <div className="premio-info">
            <span>Sorteo: 01 Nov 2025</span>
            <span>·</span>
            <span>1000 números</span>
        </div>

        <div className="contador">
            <p className="contador-label">⏳ Tiempo restante:</p>
            <div className="contador-numeros">
            <div>
                <span>{timeLeft.days}</span>
                <label>días</label>
            </div>
            <div>
                <span>{timeLeft.hours}</span>
                <label>horas</label>
            </div>
            <div>
                <span>{timeLeft.minutes}</span>
                <label>min</label>
            </div>
            <div>
                <span>{timeLeft.seconds}</span>
                <label>seg</label>
            </div>
            </div>
        </div>

        <p className="promo-text">
            <span>¡Solo $1 por número!</span> Selecciona tus números de la suerte y participa por este increíble premio.
        </p>
        </div>
    )
}
