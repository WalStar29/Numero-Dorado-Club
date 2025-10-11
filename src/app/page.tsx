'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import PremioCard from '@/components/PremioCard'
import NumeroGrid from '@/components/NumeroGrid'
import CheckoutSidebar from '@/components/CheckoutSidebar'

export default function Home() {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const handleRemove = (num: number) => {
    setSeleccionados((prev) => prev.filter((n) => n !== num))
  }

  const handleRemoveAll = () => {
    setSeleccionados([])
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
