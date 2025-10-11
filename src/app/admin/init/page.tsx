'use client'
import { useState } from 'react'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

export default function InitPage() {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [progreso, setProgreso] = useState<number>(0)
  const [saltados, setSaltados] = useState<number[]>([])

  const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const cargarNumeros = async () => {
    setEstado('loading')
    const duplicados: number[] = []

    try {
      for (let i = 1; i <= 9999; i++) {
        const id = i.toString().padStart(4, '0')
        const ref = doc(db, 'estadoNumeros', id)
        const existente = await getDoc(ref)

        if (existente.exists()) {
          duplicados.push(i)
          continue
        }

        await setDoc(ref, {
          id,
          estado: 'disponible',
          reservadoPor: null,
          timestamp: null
        })

        setProgreso(i)

        if (i % 500 === 0) {
          console.log(`⏸ Pausando en el número ${id}...`)
          await esperar(60000)
        }
      }

      setSaltados(duplicados)
      setEstado('done')
    } catch (error) {
      console.error('❌ Error al cargar números:', error)
      setEstado('error')
    }
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Inicializar 9999 Números</h1>

      {estado === 'idle' && (
        <button
          onClick={cargarNumeros}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          🧩 Cargar 9999 Números
        </button>
      )}

      {estado === 'loading' && (
        <>
          <p>Cargando números... {progreso} / 9999</p>
          <progress value={progreso} max={9999} style={{ width: '100%' }} />
        </>
      )}

      {estado === 'done' && (
        <>
          <p>✅ ¡Carga completada! Los números únicos fueron guardados.</p>
          {saltados.length > 0 && (
            <p>⚠️ Se omitieron {saltados.length} números ya existentes.</p>
          )}
        </>
      )}

      {estado === 'error' && (
        <p>❌ Error al cargar los números. Revisa la consola.</p>
      )}
    </div>
  )
}
