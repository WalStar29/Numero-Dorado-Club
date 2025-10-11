'use client'
import { useEffect, useState, ChangeEvent } from 'react'
import { collection, onSnapshot, getDocs, setDoc, doc, deleteDoc, deleteField } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import '@/styles/admin.css'

type Numero = {
  id: string
  estado: 'disponible' | 'reservado' | 'vendido'
  reservadoPor?: string
}

type Venta = {
  nombre: string
  apellido?: string
  telefono: string
  correo: string
  banco: string
  metodo: string
  numeros?: string[]
  numero?: string
  referencia: string
  monto?: string
}

const formatearID = (num: string | number): string => num.toString().padStart(4, '0')

const getColor = (estado: Numero['estado']) => {
  switch (estado) {
    case 'disponible': return 'estado-disponible'
    case 'reservado': return 'estado-reservado'
    case 'vendido': return 'estado-vendido'
    default: return ''
  }
}

export default function AdminPanel() {
  const [numeros, setNumeros] = useState<Numero[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [search, setSearch] = useState<string>('')
  const [filtro, setFiltro] = useState<'todos' | 'disponible' | 'reservado' | 'vendido' | 'ventas'>('todos')
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)

  useEffect(() => {
    const unsubscribeNumeros = onSnapshot(collection(db, 'estadoNumeros'), (snapshot) => {
      const raw = snapshot.docs.map(doc => doc.data() as Numero)
      const deduplicados = [...new Map(raw.map(n => [formatearID(n.id), { ...n, id: formatearID(n.id) }])).values()]
      setNumeros(deduplicados)
    })

    const cargarVentas = async () => {
      const ventasSnap = await getDocs(collection(db, 'ventasRegistradas'))
      const ventasData = ventasSnap.docs.map(doc => doc.data())
      const migradas = ventasData.map((venta: any) => {
        if (!venta.numeros && venta.numero) {
          return { ...venta, numeros: [formatearID(venta.numero)] }
        }
        return {
          ...venta,
          numeros: Array.isArray(venta.numeros)
            ? venta.numeros.map((n: string | number) => formatearID(n))
            : []
        }
      })
      setVentas(migradas)
    }

    cargarVentas()
    return () => unsubscribeNumeros()
  }, [])

  const cambiarEstado = async (id: string, nuevoEstado: Numero['estado']) => {
    const idFormateado = formatearID(id)
    await setDoc(doc(db, 'estadoNumeros', idFormateado), { id: idFormateado, estado: nuevoEstado }, { merge: true })
    setNumeros(prev => prev.map(n => (formatearID(n.id) === idFormateado ? { ...n, estado: nuevoEstado } : n)))
  }

  const confirmarVenta = async () => {
    if (ventaSeleccionada?.numeros) {
      const batch = ventaSeleccionada.numeros.map(async (id) => {
        const idFormateado = formatearID(id)
        await setDoc(doc(db, 'estadoNumeros', idFormateado), {
          id: idFormateado,
          estado: 'vendido',
          reservadoPor: deleteField()
        }, { merge: true })
      })

      await Promise.all(batch)

      setNumeros(prev =>
        prev.map(n =>
          ventaSeleccionada.numeros!.includes(formatearID(n.id))
            ? { ...n, estado: 'vendido' }
            : n
        )
      )

      try {
        const res = await fetch('/api/enviarCorreo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ venta: ventaSeleccionada })
        })
        const data = await res.json()
        if (data.ok) {
          alert(`📩 Correo enviado a ${ventaSeleccionada.correo}`)
        } else {
          alert('⚠️ No se pudo enviar el correo')
        }
      } catch {
        alert('❌ Error al conectar con el servidor de correo')
      }

      setVentaSeleccionada(null)
    }
  }

  const restablecerTodo = async () => {
    try {
      const snapNumeros = await getDocs(collection(db, 'estadoNumeros'))
      const snapVentas = await getDocs(collection(db, 'ventasRegistradas'))

      const actualizados: Numero[] = []

      for (const docu of snapNumeros.docs) {
        const data = docu.data() as Numero
        const idFormateado = formatearID(data.id)
        if (data.estado !== 'disponible') {
          await setDoc(doc(db, 'estadoNumeros', idFormateado), {
            id: idFormateado,
            estado: 'disponible',
            reservadoPor: deleteField()
          }, { merge: true })
          actualizados.push({ id: idFormateado, estado: 'disponible' })
        }
      }

      for (const venta of snapVentas.docs) {
        await deleteDoc(doc(db, 'ventasRegistradas', venta.id))
      }

      setNumeros(prev => prev.map(n => ({ ...n, estado: 'disponible' })))
      setVentas([])

      alert(`✅ Se restablecieron ${actualizados.length} números y se eliminaron ${snapVentas.docs.length} registros de ventas.`)
    } catch (error) {
      console.error('❌ Error al restablecer:', error)
      alert('❌ Hubo un error al actualizar Firestore.')
    }
  }

  const numerosFiltrados = [...new Map(
    numeros
      .filter(n => formatearID(n.id).includes(search.trim()))
      .filter(n => filtro === 'todos' || n.estado === filtro)
      .map(n => [formatearID(n.id), n])
  ).values()]

    return (
    <div className="admin-panel-container">
      <div className="admin-filtros">
        <button onClick={() => setFiltro('todos')} className={filtro === 'todos' ? 'activo' : ''}>Todos</button>
        <button onClick={() => setFiltro('disponible')} className={filtro === 'disponible' ? 'activo' : ''}>Disponibles</button>
        <button onClick={() => setFiltro('reservado')} className={filtro === 'reservado' ? 'activo' : ''}>Reservados</button>
        <button onClick={() => setFiltro('vendido')} className={filtro === 'vendido' ? 'activo' : ''}>Vendidos</button>
        <button onClick={() => setFiltro('ventas')} className={filtro === 'ventas' ? 'activo' : ''}>Registro de Ventas</button>
      </div>

      {(filtro === 'vendido' || filtro === 'reservado') && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <button onClick={restablecerTodo} className="admin-button-reset">
            🔄 Restablecer Todo
          </button>
        </div>
      )}

      {filtro !== 'ventas' && (
        <div className="admin-header">
          <input
            type="text"
            placeholder="Buscar número..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="admin-search"
          />
        </div>
      )}

      {filtro !== 'ventas' && (
        <div className="admin-grid">
          {numerosFiltrados.map((num) => (
            <div key={formatearID(num.id)} className={`admin-card ${getColor(num.estado)}`}>
              <p className="admin-numero">#{formatearID(num.id)}</p>
              <p className="admin-estado">{num.estado}</p>
              <div className="admin-buttons">
                {num.estado !== 'vendido' ? (
                  <button onClick={() => cambiarEstado(num.id, 'disponible')} className="admin-button-small">Disponible</button>
                ) : (
                  <span className="admin-bloqueado">🔒 Vendido</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtro === 'ventas' && (
        <div className="ventas-grid">
          {ventas.map((venta, index) => {
            const listaNumeros = Array.isArray(venta.numeros)
              ? venta.numeros.map(n => formatearID(n))
              : venta.numero
              ? [formatearID(venta.numero)]
              : []

            const todosVendidos = listaNumeros.every(num =>
              numeros.find(n => formatearID(n.id) === num)?.estado === 'vendido'
            )

            return (
              <div key={index} className={`venta-card ${todosVendidos ? 'venta-confirmada' : ''}`}>
                <p><strong>Nombre:</strong> {venta.nombre} {venta.apellido || ''}</p>
                <p><strong>Teléfono:</strong> {venta.telefono}</p>
                <p><strong>Correo:</strong> {venta.correo}</p>
                <p><strong>Banco:</strong> {venta.banco}</p>
                <p><strong>Método de Pago:</strong> {venta.metodo}</p>
                <p><strong>Monto:</strong> {venta.monto || '—'}</p>
                <p><strong>Números Asignados:</strong> {listaNumeros.map(n => `#${n}`).join(', ')}</p>
                <p><strong>Referencia:</strong> {venta.referencia}</p>
                {!todosVendidos && (
                  <button
                    className="admin-button-small confirm-button"
                    onClick={() => setVentaSeleccionada(venta)}
                  >
                    ✅ Confirmar Venta
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {ventaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Venta</h3>
            <p><strong>Nombre:</strong> {ventaSeleccionada.nombre} {ventaSeleccionada.apellido || ''}</p>
            <p><strong>Teléfono:</strong> {ventaSeleccionada.telefono}</p>
            <p><strong>Correo:</strong> {ventaSeleccionada.correo}</p>
            <p><strong>Banco:</strong> {ventaSeleccionada.banco}</p>
            <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo}</p>
            <p><strong>Monto:</strong> {ventaSeleccionada.monto || '—'}</p>
            <p><strong>Números Asignados:</strong> {
              Array.isArray(ventaSeleccionada.numeros)
                ? ventaSeleccionada.numeros.map(n => `#${formatearID(n)}`).join(', ')
                : `#${formatearID(ventaSeleccionada.numero || '')}`
            }</p>
            <p><strong>Referencia:</strong> {ventaSeleccionada.referencia}</p>
            <div className="modal-buttons">
              <button onClick={() => setVentaSeleccionada(null)} className="admin-button-small cancel-button">
                ❌ Cancelar
              </button>
              <button onClick={confirmarVenta} className="admin-button-small confirm-button">
                ✅ Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
