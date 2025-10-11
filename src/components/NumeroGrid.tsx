'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import '@/styles/NumeroGrid.css'

const TOTAL_NUMEROS = 9999 // Total de números disponibles en el sorteo

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
  const [search, setSearch] = useState<string>('') // Filtro de búsqueda
  const [todos, setTodos] = useState<Numero[]>([]) // Todos los números
  const [bloqueados, setBloqueados] = useState<Numero[]>([]) // Números no seleccionables
  const [mensajeBloqueo, setMensajeBloqueo] = useState<string | null>(null) // Mensaje de advertencia

  // Genera un UUID para identificar la sesión del usuario
  const generarUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })

  // Obtiene o genera el sessionId único para el usuario
  const sessionId = typeof window !== 'undefined'
    ? localStorage.getItem('sessionId') || (() => {
        const id = generarUUID()
        localStorage.setItem('sessionId', id)
        return id
      })()
    : ''

  // Escucha en tiempo real los cambios en la colección de números
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

      // Elimina duplicados por ID
      const todosUnicos = [...new Map(todosRaw.map(n => [n.id, n])).values()]

      // Filtra los números bloqueados (vendidos o reservados por otro)
      const bloqueados = todosUnicos.filter(b =>
        b.estado === 'vendido' ||
        (b.estado === 'reservado' && !!b.reservadoPor && b.reservadoPor !== sessionId)
      )

      setTodos(todosUnicos)
      setBloqueados(bloqueados)
    })

    return () => unsubscribe()
  }, [])

  // Limpia reservas expiradas y sincroniza los seleccionados del usuario
  useEffect(() => {
    const limpiarReservasExpiradas = async () => {
      const snapshot = await getDocs(collection(db, 'estadoNumeros'))
      const ahora = Date.now()

      const expirados = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.estado === 'reservado' && data.timestamp && ahora - data.timestamp > 10 * 60 * 1000
      })

      // Libera cada número expirado
      for (const docExp of expirados) {
        await updateDoc(doc(db, 'estadoNumeros', docExp.id), {
          estado: 'disponible',
          reservadoPor: null,
          timestamp: null
        })
      }

      // Actualiza los seleccionados del usuario actual
      const seleccionadosActuales = snapshot.docs
        .filter(doc => {
          const data = doc.data()
          return data.estado === 'reservado' && data.reservadoPor === sessionId
        })
        .map(doc => parseInt(doc.id))

      setSeleccionados(seleccionadosActuales)
    }

    limpiarReservasExpiradas()
  }, [])

  // Lógica para reservar o desmarcar un número
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
      const expirado = timestamp && ahora - timestamp > 10 * 60 * 1000

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

  // Maneja la selección visual y lógica de un número
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
    }

    if (resultado === 'desmarcado') {
      setSeleccionados(prev => prev.filter(n => n !== num))
    }
  }

  // Cálculos para mostrar progreso
  const disponibles = todos.filter(n => n.estado === 'disponible').length
  const porcentajeVendidos = ((bloqueados.length / TOTAL_NUMEROS) * 100).toFixed(1)

  // Filtro de búsqueda
  const numerosFiltrados = [
    ...new Map(
      todos
        .filter(n => n.id.toString().padStart(4, '0').includes(search))
        .map(n => [n.id, n])
    ).values()
  ]

  return (
    <div className="numero-grid-container">
      {/* Encabezado con contadores */}
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

      {/* Buscador */}
      <div className="numero-grid-header">
        <input
          type="text"
          placeholder="Buscar número..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="numero-busqueda"
        />
      </div>

            {/* Leyenda visual para el usuario */}
      <div className="numero-leyenda">
        <div className="leyenda-item disponible">Disponible</div>
        <div className="leyenda-item seleccionado">Seleccionado</div>
        <div className="leyenda-item vendido">Vendido</div>
      </div>

      {/* Mensaje de bloqueo temporal (se oculta en 3 segundos) */}
      {mensajeBloqueo && (
        <div className="mensaje-bloqueo">
          {mensajeBloqueo}
        </div>
      )}

      {/* Renderizado del grid de números */}
      <div className="numero-grid">
        {numerosFiltrados.map((num) => {
          const isSeleccionado = seleccionados.includes(num.id)
          const numeroFormateado = num.id.toString().padStart(4, '0')

          // Determina la clase visual según el estado
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
              onClick={() => handleSelect(num.id)} // Siempre permite el click para mostrar mensaje
              style={clase === 'vendido' ? { opacity: 0.6 } : {}} // Visualmente atenuado si está vendido
            >
              {numeroFormateado}
            </div>
          )
        })}
      </div>
    </div>
  )
}
