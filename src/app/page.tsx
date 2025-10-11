'use client'
import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import Navbar from '@/components/Navbar'
import PremioCard from '@/components/PremioCard'
import NumeroGrid from '@/components/NumeroGrid'
import CheckoutSidebar from '@/components/CheckoutSidebar'

export default function Home() {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const sessionId = typeof window !== 'undefined'
    ? localStorage.getItem('sessionId') || ''
    : ''

  // 🔄 Elimina un número del carrito y lo libera en Firestore
  const handleRemove = async (num: number) => {
    const id = num.toString().padStart(4, '0')
    const ref = doc(db, 'estadoNumeros', id)

    try {
      await updateDoc(ref, {
        estado: 'disponible',
        reservadoPor: null,
        timestamp: null
      })
      setSeleccionados((prev) => prev.filter((n) => n !== num))
    } catch (error) {
      console.error(`Error al liberar el número #${id}:`, error)
    }
  }

  // 🧹 Limpia todo el carrito y libera los números en lote
  const handleRemoveAll = async () => {
    const updates = seleccionados.map(async (num) => {
      const id = num.toString().padStart(4, '0')
      const ref = doc(db, 'estadoNumeros', id)
      return updateDoc(ref, {
        estado: 'disponible',
        reservadoPor: null,
        timestamp: null
      })
    })

    try {
      await Promise.all(updates)
      setSeleccionados([])
    } catch (error) {
      console.error('Error al liberar todos los números:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PremioCard />
          <NumeroGrid
            seleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
          />
        </div>
        <CheckoutSidebar
          seleccionados={seleccionados}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
        />
      </section>
    </main>
  )
}
