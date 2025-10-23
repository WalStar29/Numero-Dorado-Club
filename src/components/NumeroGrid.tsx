'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import '@/styles/NumeroGrid.css'

const TOTAL_NUMEROS = 9999
const TIEMPO_EXPIRACION = 30 * 60 * 1000 // 30 minutos

type NumeroGridProps = {
  seleccionados: number[]
  setSeleccionados: React.Dispatch<React.SetStateAction<number[]>>
}

type Numero = {
  id: number
  estado: 'disponible' | 'reservado' | 'vendido'
  reservadoPor?: string
}

export default function NumeroGrid({ seleccionados, setSeleccionados }: NumeroGridProps) {
  const [search, setSearch] = useState<string>('')
  const [todos, setTodos] = useState<Numero[]>([])
  const [bloqueados, setBloqueados] = useState<Numero[]>([])
  const [mensajeBloqueo, setMensajeBloqueo] = useState<string | null>(null)

  const generarUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })

  const sessionId = typeof window !== 'undefined'
    ? localStorage.getItem('sessionId') || (() => {
        const id = generarUUID()
        localStorage.setItem('sessionId', id)
        return id
      })()
    : ''

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'estadoNumeros'), (snapshot) => {
      const todosRaw = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: parseInt(doc.id),
          estado: data.estado,
          reservadoPor: data.reservadoPor
        }
      })

      const todosUnicos = [...new Map(todosRaw.map(n => [n.id, n])).values()]

      const bloqueados = todosUnicos.filter(b =>
        b.estado === 'vendido' ||
        (b.estado === 'reservado' && !!b.reservadoPor && b.reservadoPor !== sessionId)
      )

      setTodos(todosUnicos)
      setBloqueados(bloqueados)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      const snapshot = await getDocs(collection(db, 'estadoNumeros'))
      const ahora = Date.now()

      const expirados = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.estado === 'reservado' && data.timestamp && ahora - data.timestamp > TIEMPO_EXPIRACION
      })

      for (const docExp of expirados) {
        await updateDoc(doc(db, 'estadoNumeros', docExp.id), {
          estado: 'disponible',
          reservadoPor: null,
          timestamp: null
        })
      }

      const seleccionadosActuales = snapshot.docs
        .filter(doc => {
          const data = doc.data()
          return data.estado === 'reservado' && data.reservadoPor === sessionId
        })
        .map(doc => parseInt(doc.id))

      setSeleccionados(seleccionadosActuales)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

    const reservarNumero = async (num: number) => {
    const id = num.toString().padStart(4, '0')
    const ref = doc(db, 'estadoNumeros', id)

    try {
      const snapshot = await getDoc(ref)
      const data = snapshot.data()
      const estadoActual = data?.estado
      const reservadoPor = data?.reservadoPor
      const timestamp = data?.timestamp
      const ahora = Date.now()
      const expirado = timestamp && ahora - timestamp > TIEMPO_EXPIRACION

      if (estadoActual === 'vendido') {
        setMensajeBloqueo(`❌ El número #${id} ya fue vendido.`)
        setTimeout(() => setMensajeBloqueo(null), 3000)
        return false
      }

      if (estadoActual === 'reservado' && reservadoPor !== sessionId && !expirado) {
        setMensajeBloqueo(`⚠️ El número #${id} está reservado por otro comprador.`)
        setTimeout(() => setMensajeBloqueo(null), 3000)
        return false
      }

      if (estadoActual === 'reservado' && expirado) {
        await updateDoc(ref, {
          estado: 'disponible',
          reservadoPor: null,
          timestamp: null
        })
      }

      if (estadoActual === 'reservado' && reservadoPor === sessionId && !expirado) {
        await updateDoc(ref, {
          estado: 'disponible',
          reservadoPor: null,
          timestamp: null
        })
        return 'desmarcado'
      }

      await setDoc(ref, {
        id,
        estado: 'reservado',
        reservadoPor: sessionId,
        timestamp: Date.now()
      }, { merge: true })

      return 'reservado'
    } catch (error) {
      console.error(`Error al reservar/desmarcar #${id}:`, error)
      return false
    }
  }

  const handleSelect = async (num: number) => {
    const bloqueado = bloqueados.find(b => b.id === num)

    if (bloqueado?.estado === 'vendido') {
      setMensajeBloqueo(`❌ El número #${num.toString().padStart(4, '0')} ya fue vendido.`)
      setTimeout(() => setMensajeBloqueo(null), 3000)
      return
    }

    if (bloqueado?.estado === 'reservado' && bloqueado.reservadoPor !== sessionId) {
      setMensajeBloqueo(`⚠️ El número #${num.toString().padStart(4, '0')} está reservado por otro comprador.`)
      setTimeout(() => setMensajeBloqueo(null), 3000)
      return
    }

    const resultado = await reservarNumero(num)

    if (resultado === 'reservado') {
      setSeleccionados(prev => [...prev, num])

      setTimeout(async () => {
        const ref = doc(db, 'estadoNumeros', num.toString().padStart(4, '0'))
        const snapshot = await getDoc(ref)
        const data = snapshot.data()

        if (data?.estado === 'reservado' && data?.reservadoPor === sessionId) {
          await updateDoc(ref, {
            estado: 'disponible',
            reservadoPor: null,
            timestamp: null
          })
          setSeleccionados(prev => prev.filter(n => n !== num))
        }
      }, TIEMPO_EXPIRACION)
    }

    if (resultado === 'desmarcado') {
      setSeleccionados(prev => prev.filter(n => n !== num))
    }
  }

  const seleccionarDosAleatorios = async () => {
    const disponibles = todos.filter(n =>
      n.estado === 'disponible' ||
      (n.estado === 'reservado' && n.reservadoPor === sessionId)
    ).map(n => n.id)

    const restantes = disponibles.filter(id => !seleccionados.includes(id))

    if (restantes.length < 2) {
      setMensajeBloqueo('⚠️ No hay suficientes números disponibles para seleccionar al azar.')
      setTimeout(() => setMensajeBloqueo(null), 3000)
      return
    }

    const seleccionadosAleatorios: number[] = []
    while (seleccionadosAleatorios.length < 2) {
      const randomIndex = Math.floor(Math.random() * restantes.length)
      const candidato = restantes[randomIndex]
      if (!seleccionadosAleatorios.includes(candidato)) {
        await handleSelect(candidato)
        seleccionadosAleatorios.push(candidato)
      }
    }
  }

  const disponibles = todos.filter(n => n.estado === 'disponible').length
  const porcentajeVendidos = ((bloqueados.length / TOTAL_NUMEROS) * 100).toFixed(1)

  const numerosFiltrados = [
    ...new Map(
      todos
        .filter(n => n.id.toString().padStart(4, '0').includes(search))
        .map(n => [n.id, n])
    ).values()
  ]

  return (
    <div className="numero-grid-container">
      <div className="numero-grid-top-lineal">
        <h2 className="numero-titulo-lineal">Selecciona tus Números</h2>
        <div className="numero-contadores-lineal">
          <span className="disponibles">Disponibles: {disponibles}</span>
          <span className="vendidos">Bloqueados: {bloqueados.length}</span>
        </div>
        <div className="numero-porcentaje-lineal">
          <span className="porcentaje-texto">Progreso de venta:</span>
          <span className="porcentaje-valor">{porcentajeVendidos}%</span>
          <div className="porcentaje-barra">
            <div
              className="porcentaje-barra-fill"
              style={{ width: `${porcentajeVendidos}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="numero-grid-header">
        <div className="numero-grid-header-inner">
          <input
            type="text"
            placeholder="Buscar número..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="numero-busqueda"
          />
          <button
            className="numero-aleatorio-btn"
            onClick={seleccionarDosAleatorios}
          >
            🎲 Seleccionar 2 al azar
          </button>
        </div>
      </div>

      <div className="numero-leyenda">
        <div className="leyenda-item disponible">Disponible</div>
        <div className="leyenda-item seleccionado">Seleccionado</div>
        <div className="leyenda-item vendido">Vendido</div>
      </div>

      {mensajeBloqueo && (
        <div className="mensaje-bloqueo">
          {mensajeBloqueo}
        </div>
      )}

      <div className="numero-grid">
        {numerosFiltrados.map((num) => {
          const isSeleccionado = seleccionados.includes(num.id)
          const numeroFormateado = num.id.toString().padStart(4, '0')

          const clase = num.estado === 'vendido'
            ? 'vendido'
            : num.estado === 'reservado' && num.reservadoPor !== sessionId
            ? 'vendido'
            : isSeleccionado
            ? 'seleccionado'
            : 'disponible'

          return (
            <div
              key={num.id}
              className={`numero-box ${clase}`}
              onClick={() => handleSelect(num.id)}
              style={clase === 'vendido' ? { opacity: 0.6 } : {}}
            >
              {numeroFormateado}
            </div>
          )
        })}
      </div>
    </div>
  )
}
