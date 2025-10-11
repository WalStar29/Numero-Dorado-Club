'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import '@/styles/PremioCard.css'

type Premio = {
    id: number
    nombre: string
    descripcion: string
    valor: string
    imagen: string
}

const premios: Premio[] = [
    {
        id: 1,
        nombre: 'iPhone 15 Pro Max',
        descripcion: '256GB – Titanio Natural',
        valor: '$1,200',
        imagen: '/iphone.jpg',
    },
    {
        id: 2,
        nombre: 'PlayStation 5',
        descripcion: 'Edición Digital + 2 Controles',
        valor: '$600',
        imagen: '/play.jpg',
    },
    {
        id: 3,
        nombre: 'Moto Honda',
        descripcion: 'Estilo Unico',
        valor: '$1,100',
        imagen: '/moto.jpg',
    },
]

type TimeLeft = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export default function CarruselPremios() {
    const [index, setIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    const drawDate = new Date('2025-11-01T20:00:00')
    const premio = premios[index]

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

    const handlePrev = () => setIndex((prev) => (prev === 0 ? premios.length - 1 : prev - 1))
    const handleNext = () => setIndex((prev) => (prev === premios.length - 1 ? 0 : prev + 1))

    return (
        <div className="carrusel-premios">
        <div className="premio-card">
            <div className="badge-premio">Premio Principal <span>¡ACTIVA!</span></div>

            <Image
            src={premio.imagen}
            alt={premio.nombre}
            width={400}
            height={300}
            className="premio-imagen"
            priority
            />

            <div className="flechas">
            <button onClick={handlePrev}>←</button>
            <span>Premio {premio.id} de 3</span>
            <button onClick={handleNext}>→</button>
            </div>

            <h2 className="premio-nombre">{premio.nombre}</h2>
            <p className="premio-descripcion">{premio.descripcion}</p>
            <p className="premio-valor">Valor: {premio.valor}</p>

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
        </div>
    )
}
