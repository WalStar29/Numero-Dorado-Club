'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import '@/styles/PremioCard.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

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
    nombre: '',
    descripcion: '',
    valor: '',
    imagen: '/flayer.jpg',
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

  // 🎯 Sorteo el 20 de noviembre de 2025 a medianoche UTC
  const drawDateUTC = new Date(Date.UTC(2025, 10, 20, 0, 0, 0)) // Mes 10 = noviembre

  useEffect(() => {
    const interval = setInterval(() => {
      const nowLocal = new Date()
      const diff = drawDateUTC.getTime() - nowLocal.getTime()

      const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
      const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24))
      const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60))
      const seconds = Math.max(0, Math.floor((diff / 1000) % 60))

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handlePrev = () =>
    setIndex((prev) => (prev === 0 ? premios.length - 1 : prev - 1))
  const handleNext = () =>
    setIndex((prev) => (prev === premios.length - 1 ? 0 : prev + 1))

  const premio = premios[index]

  return (
    <div className="carrusel-premios">
      <div className="premio-card">
        <img src="/trebol.svg" alt="" />
        <div className="badge-premio">
          Sorteo <span>¡ACTIVO!</span>
        </div>

        <Image
          src={premio.imagen.trim()}
          alt={premio.nombre}
          width={300}
          height={300}
          className="premio-imagen"
          priority
        />

        {/* 
        <div className="flechas">
          <button onClick={handlePrev}>
            <FaArrowLeft />
          </button>
          <span>Premio {premio.id} de {premios.length}</span>
          <button onClick={handleNext}>
            <FaArrowRight />
          </button>
        </div>*/}

        <h2 className="premio-nombre">{premio.nombre}</h2>
        <p className="premio-descripcion">{premio.descripcion}</p>
        <p className="premio-valor">{premio.valor}</p>

        <div className="premio-info">
          <span>Sorteo: 20 Nov 2025</span>
          <span>·</span>
          <span>9999 números</span>
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
