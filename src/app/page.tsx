'use client'
import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import Navbar from '@/components/Navbar'
import PremioCard from '@/components/PremioCard'
import NumeroGrid from '@/components/NumeroGrid'
import CheckoutSidebar from '@/components/CheckoutSidebar'
import '@/styles/Home.css'
import { BsJustify } from 'react-icons/bs'


export default function Home() {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const sessionId = typeof window !== 'undefined'
    ? localStorage.getItem('sessionId') || ''
    : ''

  const liberarNumero = async (num: number) => {
    const id = num.toString().padStart(4, '0')
    const ref = doc(db, 'estadoNumeros', id)
    await updateDoc(ref, {
      estado: 'disponible',
      reservadoPor: null,
      timestamp: null
    })
  }

  const handleRemove = async (num: number) => {
    try {
      await liberarNumero(num)
      setSeleccionados(prev => prev.filter(n => n !== num))
    } catch (error) {
      console.error(`Error al liberar el número #${num}:`, error)
    }
  }

  const handleRemoveAll = async () => {
    try {
      await Promise.all(seleccionados.map(liberarNumero))
      setSeleccionados([])
    } catch (error) {
      console.error('Error al liberar todos los números:', error)
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />
      {/* 🎁 Sección del premio principal */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <PremioCard />
      </section>

      {/* 🎲 Sección de selección de números */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NumeroGrid
            seleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
          />
        </div>

        {/* 🛒 Sidebar de checkout */}
        <CheckoutSidebar
          seleccionados={seleccionados}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
        />
      </section>
    </main>
  )
}
