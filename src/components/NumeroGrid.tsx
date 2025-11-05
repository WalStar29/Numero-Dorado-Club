'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc,Timestamp} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import '@/styles/NumeroGrid.css'

const TOTAL_NUMEROS = 10000

type NumeroGridProps = {
  seleccionados: number[]
  setSeleccionados: React.Dispatch<React.SetStateAction<number[]>>
}

type Numero = {
  id: number
  estado: 'disponible' | 'reservado' | 'vendido'
  reservadoPor?: string
  timestamp?: Timestamp
}

export default function NumeroGrid({ seleccionados, setSeleccionados }: NumeroGridProps) {
  const [search, setSearch] = useState<string>('')
  const [todos, setTodos] = useState<Numero[]>([])
  const [bloqueados, setBloqueados] = useState<Numero[]>([])
  const [mensajeBloqueo, setMensajeBloqueo] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  const generarUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })

  useEffect(() => {
    const stored = localStorage.getItem('sessionId')
    if (stored) {
      setSessionId(stored)
    } else {
      const nuevo = generarUUID()
      localStorage.setItem('sessionId', nuevo)
      setSessionId(nuevo)
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = onSnapshot(collection(db, 'estadoNumeros'), (snapshot) => {
      const todosRaw = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: parseInt(doc.id),
          estado: data.estado,
          reservadoPor: data.reservadoPor,
          timestamp: data.timestamp
        }
      })

      const todosUnicos = [...new Map(todosRaw.map(n => [n.id, n])).values()]

      const bloqueados = todosUnicos.filter(b =>
        b.estado === 'vendido' ||
        (b.estado === 'reservado' && !!b.reservadoPor && b.reservadoPor !== sessionId)
      )

      const seleccionadosActuales = todosUnicos
        .filter(n => n.estado === 'reservado' && n.reservadoPor === sessionId)
        .map(n => n.id)

      setTodos(todosUnicos)
      setBloqueados(bloqueados)
      setSeleccionados(seleccionadosActuales)
    })

    return () => unsubscribe()
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || todos.length === 0) return

    const interval = setInterval(() => {
      const ahora = Timestamp.now()

      todos.forEach((num) => {
        if (
          num.estado === 'reservado' &&
          num.reservadoPor === sessionId &&
          num.timestamp instanceof Timestamp
        ) {
          const segundosPasados = ahora.seconds - num.timestamp.seconds
          if (segundosPasados > 1200) { // 20 minutos
            const id = num.id.toString().padStart(4, '0')
            const ref = doc(db, 'estadoNumeros', id)

            updateDoc(ref, {
              estado: 'disponible',
              reservadoPor: null,
              timestamp: null
            })
              .then(() => {
                console.log(`⏱️ Número #${id} liberado por caducidad automática`)
              })
              .catch((error) => {
                console.error(`Error al liberar #${id}:`, error)
              })
          }
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, 
  [todos, sessionId])
  const reservarNumero = async (num: number) => {
    const id = num.toString().padStart(4, '0')
    const ref = doc(db, 'estadoNumeros', id)

    try {
      const snapshot = await getDoc(ref)
      const data = snapshot.data()
      const estadoActual = data?.estado
      const reservadoPor = data?.reservadoPor

      if (estadoActual === 'vendido') {
        setMensajeBloqueo(`❌ El número #${id} ya fue vendido.`)
        setTimeout(() => setMensajeBloqueo(null), 3000)
        return false
      }

      if (estadoActual === 'reservado' && reservadoPor !== sessionId) {
        setMensajeBloqueo(`⚠️ El número #${id} está reservado por otro comprador.`)
        setTimeout(() => setMensajeBloqueo(null), 3000)
        return false
      }

      if (estadoActual === 'reservado' && reservadoPor === sessionId) {
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
        timestamp: Timestamp.now()
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
