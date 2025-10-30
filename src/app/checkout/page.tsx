'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ResumenCompra from '@/components/ResumenCompra'
import '@/styles/Checkout.css'
import { FaCreditCard, FaMobileAlt } from 'react-icons/fa'
import { SiBinance } from 'react-icons/si'
import { MdWarningAmber, MdContactPage } from 'react-icons/md'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

export default function Page() {
  const router = useRouter()

  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [bancoOperacion, setBancoOperacion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const precioPorNumero = 1.0
  const tasaCambio = 250
  const totalUSD = seleccionados.length * precioPorNumero
  const totalBs = totalUSD * tasaCambio
  const total = totalUSD

  const metodoActivo = (metodo: string) =>
    metodoPago === metodo ? 'btn-metodo activo' : 'btn-metodo'

  const renderDato = (label: string, valor: string) =>
    valor.trim() !== '' ? <p><strong>{label}:</strong> {valor}</p> : null

  useEffect(() => {
    const guardados = localStorage.getItem('carritoNumeros')
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados)
        if (Array.isArray(parsed)) {
          setSeleccionados(parsed)
        }
      } catch (error) {
        console.error('Error al leer el carrito:', error)
      }
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mostrarModal ? 'hidden' : 'auto'
  }, [mostrarModal])

  const formValido =
    nombre.trim() !== '' &&
    apellido.trim() !== '' &&
    correo.trim() !== '' &&
    telefono.trim() !== '' &&
    metodoPago !== '' &&
    referencia.trim() !== '' &&
    seleccionados.length > 0 &&
    (metodoPago === 'binance' || bancoOperacion.trim() !== '')

  const handleEnviarWhatsApp = async () => {
    if (enviando) return
    setEnviando(true)

    const numerosUnicos = Array.from(new Set(seleccionados)).map(n =>
      n.toString().padStart(4, '0')
    )

    const ahora = new Date()
    const fechaHora = ahora.toISOString() // ✅ formato ISO para Firestore
    const fechaVisible = ahora.toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      hour12: false
    }) // ✅ formato local para WhatsApp

    const nuevaVenta = {
      nombre,
      apellido,
      telefono,
      correo,
      banco: bancoOperacion,
      metodo: metodoPago === 'movil' ? 'Pago móvil' : 'Binance Pay',
      numeros: numerosUnicos,
      referencia,
      monto: metodoPago === 'movil'
        ? `Bs ${totalBs.toFixed(2)}`
        : `$${totalUSD.toFixed(2)}`,
      fechaHora // ✅ guardado como ISO
    }

    try {
      const referenciaDoc = doc(db, 'ventasRegistradas', nuevaVenta.referencia)
      const docExistente = await getDoc(referenciaDoc)

      if (docExistente.exists()) {
        alert('⚠️ Ya existe una venta con esta referencia. Usa una diferente.')
        setEnviando(false)
        return
      }

      const confirmar = window.confirm(
        '¿Deseas enviar los datos por WhatsApp ahora?\n\nEsto es necesario para validar tu compra.'
      )

      if (!confirmar) {
        setEnviando(false)
        return
      }

      const mensaje = `🎉 ¡Hola! Quiero confirmar mi compra en *Número Dorado Club*:\n\n` +
        `🕒 *Fecha y hora:* ${fechaVisible}\n` +
        `👤 *Nombre:* ${nuevaVenta.nombre} ${nuevaVenta.apellido}\n` +
        `📧 *Correo:* ${nuevaVenta.correo}\n` +
        `📱 *Teléfono:* ${nuevaVenta.telefono}\n` +
        `💳 *Método de pago:* ${nuevaVenta.metodo}\n` +
        `💰 *Monto:* ${nuevaVenta.monto}\n` +
        `🔢 *Referencia:* ${nuevaVenta.referencia}\n` +
        (metodoPago === 'movil' ? `🏦 *Banco:* ${nuevaVenta.banco}\n` : '') +
        `🎯 *Números seleccionados:* ${nuevaVenta.numeros.join(', ')}\n\n` +
        `✅ ¡Gracias por confiar en Número Dorado Club! Tu compra ha sido recibida y será confirmada en las próximas 24 horas. Te avisaremos apenas esté lista. 🙌 ¡Mucha suerte!
`

      const numeroDestino = '584223939612'
      const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`
      const ventana = window.open(url, '_blank')

      if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
        alert('❌ No se pudo abrir WhatsApp. Verifica tu conexión o configuración del navegador.')
        setEnviando(false)
        return
      }

      await setDoc(referenciaDoc, nuevaVenta)
      console.log('✅ Venta registrada en Firestore')

      for (const num of numerosUnicos) {
        const ref = doc(db, 'estadoNumeros', num)
        await setDoc(ref, {
          estado: 'reservado',
          reservadoPor: 'confirmado',
          timestamp: Date.now()
        }, { merge: true })
      }

      localStorage.removeItem('carritoNumeros')
      setSeleccionados([])

      setTimeout(() => {
        setMostrarModal(false)
        document.body.style.overflow = 'auto'
        router.push('/')
      }, 500)

    } catch (error) {
      console.error('❌ Error al guardar venta en Firestore:', error)
      alert('❌ Hubo un error al registrar tu compra. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
  <div>
    <Navbar />
    {seleccionados.length > 0 ? (
      <ResumenCompra
        seleccionados={seleccionados}
        precioPorNumero={precioPorNumero}
        premio="iPhone 15 Pro Max 256GB"
        fechaSorteo="01 de noviembre de 2025"
        tasaCambio={tasaCambio}
      />
    ) : (
      <p style={{ textAlign: 'center' }}>No hay números en el carrito.</p>
    )}

    <div className="resumen-box">
      <h3 className="titulo-dorado"><MdContactPage /> Información de Contacto</h3>

      <div className="campo-contacto">
        <label htmlFor="name">Nombre</label>
        <input type="text" id="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div className="campo-contacto">
        <label htmlFor="lastname">Apellido</label>
        <input type="text" id="lastname" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
      </div>

      <div className="campo-contacto">
        <label htmlFor="correo">Correo Electrónico</label>
        <input type="email" id="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
      </div>

      <div className="campo-contacto">
        <label htmlFor="telefono">Número de Teléfono</label>
        <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
      </div>
    </div>

    <div className="metodo-pago" style={{ marginTop: '2rem' }}>
      <h3 className="titulo-dorado"><FaCreditCard /> Método de Pago</h3>
      <div className="opciones-pago">
        <button className={metodoActivo('binance')} onClick={() => setMetodoPago('binance')}>
          <SiBinance /> Binance Pay<br /><small>Popular · USDT</small>
        </button>
        <button className={metodoActivo('movil')} onClick={() => setMetodoPago('movil')}>
          <FaMobileAlt /> Pago Móvil<br /><small>Popular · Todos los bancos venezolanos</small>
        </button>
      </div>

      {metodoPago === 'binance' && (
        <div className="info-pago">
          <h4>Binance</h4>
          {renderDato('Binance ID', '545664561')}
          <h5>Importante:</h5>
          <ul>
            <li>Envía el monto exacto mostrado en tu carrito</li>
            <li>Guarda el comprobante de pago</li>
            <li>El número de operación es obligatorio</li>
            <li>Los pagos se verifican en 24–48 horas</li>
          </ul>
        </div>
      )}

      {metodoPago === 'movil' && (
        <div className="info-pago">
          <h4>Pago Móvil</h4>
          {renderDato('Banco', 'BANCO NACINAL DE CREDITO')}
          {renderDato('Teléfono', '0422-3939612')}
          {renderDato('Cédula', 'V- 30.563.320-4')}
          {renderDato('Titular', 'NUMERO DORADO CLUB GUACACHE')}
          <p><strong>Monto a pagar:</strong> Bs {totalBs.toFixed(2)}</p>
          <h5>Importante:</h5>
          <ul>
            <li>Envía el monto exacto mostrado en tu carrito</li>
            <li>Guarda el comprobante de pago</li>
            <li>El número de operación es obligatorio</li>
            <li>Los pagos se verifican en 24–48 horas</li>
          </ul>
        </div>
      )}
    </div>

    <div className="referencia-pago" style={{ marginTop: '2rem' }}>
      <h4 className="titulo-dorado">Número de Operación</h4>
      <div className="campo-banco-operacion">
        <label htmlFor="bancoOperacion" className="label-referencia">
          Banco con el que realizaste la operación <span className="requerido">*</span>
        </label>
        <select
          id="bancoOperacion"
          name="bancoOperacion"
          value={bancoOperacion}
          onChange={(e) => setBancoOperacion(e.target.value)}
          required
          className="select-banco"
          disabled={metodoPago !== 'movil'}
        >
          <option value="">Selecciona tu banco</option>
          <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
          <option value="0114 - Banesco">0114 - Banesco</option>
          <option value="0134 - Bancaribe">0134 - Bancaribe</option>
          <option value="0172 - Bancamiga">0172 - Bancamiga</option>
          <option value="0191 - BNC">0191 - BNC</option>
          {/* ...otros bancos omitidos por brevedad */}
        </select>
      </div>

      <label htmlFor="referencia" className="label-referencia">
        Número de Referencia / Transacción <span className="requerido">*</span>
      </label>
      <input
        type="text"
        id="referencia"
        name="referencia"
        placeholder="Ej: 123456789 o TXN123ABC"
        value={referencia}
        onChange={(e) => setReferencia(e.target.value)}
        required
        className="input-referencia"
      />
      <p className="texto-ayuda">
        Ingresa el número de referencia, transacción o comprobante que te proporcionó tu banco o plataforma de pago.
      </p>
      <p className="texto-ayuda2">
        <MdWarningAmber style={{ color: 'var(--color-red)', fontSize: '1.2rem' }} />
        <strong>Este número es esencial para verificar tu pago.</strong> Asegúrate de copiarlo correctamente del comprobante.
      </p>
    </div>

    <div className="confirmacion-compra">
      <button
        className={`btn-confirmar ${formValido ? 'activo' : 'desactivado'}`}
        disabled={!formValido || enviando}
        onClick={() => setMostrarModal(true)}
      >
        Confirmar Compra – Total: {
          metodoPago === 'movil'
            ? `Bs ${totalBs.toFixed(2)}`
            : `$${total.toFixed(2)}`
        }
      </button>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <button
              className="btn-cerrar-x"
              onClick={() => setMostrarModal(false)}
              aria-label="Cerrar modal"
            >
              ✖
            </button>

            <h3>✅ Confirmación de Compra</h3>

            <section>
              <h4>Números Seleccionados</h4>
              <ul className="lista-numeros-modal">
                {[...new Set(seleccionados)].map((num) => (
                  <li key={num}>#{num.toString().padStart(3, '0')}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Información de Contacto</h4>
              <p><strong>Nombre:</strong> {nombre}</p>
              <p><strong>Apellido:</strong> {apellido}</p>
              <p><strong>Correo Electrónico:</strong> {correo}</p>
              <p><strong>Teléfono:</strong> {telefono}</p>
            </section>

            <section>
              <h4>Método de Pago</h4>
              <p><strong>Seleccionado:</strong> {metodoPago === 'movil' ? 'Pago Móvil' : 'Binance Pay'}</p>
              <p><strong>Monto:</strong> {
                metodoPago === 'movil'
                  ? `Bs ${totalBs.toFixed(2)}`
                  : `$${total.toFixed(2)}`
              }</p>
            </section>

            <section>
              <h4>Referencia de Pago</h4>
              <p><strong>Número de Operación:</strong> {referencia}</p>
              {metodoPago === 'movil' && (
                <p><strong>Banco utilizado:</strong> {bancoOperacion || 'No seleccionado'}</p>
              )}
            </section>

            <section>
              <h4>Total de la Compra</h4>
              <p><strong>Total en dólares:</strong> ${total.toFixed(2)}</p>
              <p><strong>Total en bolívares:</strong> Bs {totalBs.toFixed(2)}</p>
            </section>

            <section className="mensaje-confirmacion">
              <p>
                🛡️ <strong>Importante:</strong> Asegúrese de que todos los datos estén correctos. Esta información será utilizada para comunicarnos con usted y validar su participación en el sorteo del <strong>Número Dorado</strong>. ¡Mucha suerte! 🍀
              </p>
            </section>

            <div className="modal-botones solo-enviar">
              <button
                className="btn-enviar-modal"
                onClick={handleEnviarWhatsApp}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
