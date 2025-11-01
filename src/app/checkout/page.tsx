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
  const [mostrarConfirmacionFinal, setMostrarConfirmacionFinal] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const precioPorNumero = 1.0
  const tasaCambio = 250
  const numerosUnicos = Array.from(new Set(seleccionados))
  const totalUSD = numerosUnicos.length * precioPorNumero
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
    numerosUnicos.length > 0 &&
    (metodoPago === 'binance' || metodoPago === 'zelle' || bancoOperacion.trim() !== '')

  const handleConfirmarCompra = async () => {
    if (enviando) return
    setEnviando(true)

    try {
      const ahora = new Date()
      const fechaHora = ahora.toISOString()

      const nuevaVenta = {
        nombre,
        apellido,
        telefono,
        correo,
        banco: bancoOperacion,
        metodo:
          metodoPago === 'movil' ? 'Pago móvil' :
          metodoPago === 'binance' ? 'Binance Pay' :
          'Zelle',
        numeros: numerosUnicos.map(n => n.toString().padStart(4, '0')),
        referencia,
        monto: metodoPago === 'movil'
          ? `Bs ${totalBs.toFixed(2)}`
          : `$${totalUSD.toFixed(2)}`,
        fechaHora
      }

      const referenciaDoc = doc(db, 'ventasRegistradas', nuevaVenta.referencia)
      const docExistente = await getDoc(referenciaDoc)

      if (docExistente.exists()) {
        alert('⚠️ Ya existe una venta con esta referencia. Usa una diferente.')
        setEnviando(false)
        return
      }

      await setDoc(referenciaDoc, nuevaVenta)
      for (const num of nuevaVenta.numeros) {
        const ref = doc(db, 'estadoNumeros', num)
        await setDoc(ref, {
          estado: 'reservado',
          reservadoPor: 'confirmado',
          timestamp: Date.now()
        }, { merge: true })
      }

      localStorage.removeItem('carritoNumeros')
      setSeleccionados([])
      setMostrarModal(false)
      setMostrarConfirmacionFinal(true)

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
      {numerosUnicos.length > 0 ? (
        <ResumenCompra
          seleccionados={numerosUnicos}
          precioPorNumero={precioPorNumero}
          premio="iPhone 15 Pro Max 256GB"
          fechaSorteo="01 de noviembre de 2025"
          tasaCambio={tasaCambio}
        />
      ) : (
        <p style={{ textAlign: 'center' }}>No hay números en el carrito.</p>
      )}

      {/* Información de contacto */}
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

      {/* Métodos de pago */}
      <div className="metodo-pago" style={{ marginTop: '2rem' }}>
        <h3 className="titulo-dorado"><FaCreditCard /> Método de Pago</h3>
        <div className="opciones-pago">
          <button className={metodoActivo('binance')} onClick={() => setMetodoPago('binance')}>
            <SiBinance /> Binance Pay<br /><small>Popular · USDT</small>
          </button>
          <button className={metodoActivo('movil')} onClick={() => setMetodoPago('movil')}>
            <FaMobileAlt /> Pago Móvil<br /><small>Popular · Todos los bancos venezolanos</small>
          </button>
          <button className={metodoActivo('zelle')} onClick={() => setMetodoPago('zelle')}>
            <FaCreditCard /> Zelle<br /><small>Popular · USD</small>
          </button>
        </div>
        {metodoPago === 'binance' && (
          <div className="info-pago">
            <h4>Binance</h4>
            {renderDato('Binance ID', '545664561')}
            <p><strong>Monto a pagar:</strong> $ {totalUSD.toFixed(2)}</p>
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

        {metodoPago === 'zelle' && (
          <div className="info-pago">
            <h4>Zelle</h4>
            {renderDato('Correo Zelle', 'Adrianaguerrero2890@gmail.com')}
            {renderDato('Titular', 'Yennifer Guerrero')}
            <p><strong>Monto a pagar:</strong> $ {totalUSD.toFixed(2)}</p>
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

      {/* Referencia y banco */}
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

      {/* Confirmación */}
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

        {/* Modal de confirmación de datos */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <button className="btn-cerrar-x" onClick={() => setMostrarModal(false)} aria-label="Cerrar modal">✖</button>
              <h3>✅ Confirmación de Compra</h3>

              <section>
                <h4>Números Seleccionados</h4>
                <ul className="lista-numeros-modal">
                  {numerosUnicos.map((num) => (
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
                <p><strong>Seleccionado:</strong> {
                  metodoPago === 'movil'
                    ? 'Pago Móvil'
                    : metodoPago === 'binance'
                    ? 'Binance Pay'
                    : 'Zelle'
                }</p>
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
                <p>🛡️ <strong>Importante:</strong> Asegúrese de que todos los datos estén correctos. Esta información será utilizada para validar su participación en el sorteo del <strong>Número Dorado</strong>.</p><br />
                <p>📲 Al hacer clic en <strong>Enviar</strong>, su compra será registrada y validada en un plazo de <strong>24 a 48 horas</strong>.</p><br />
                <p>🚫 <strong>Evite cualquier intento de estafa o modificación del comprobante.</strong> Solo se validarán los datos enviados desde esta plataforma.</p><br />
                <p>🙌 ¡Gracias por confiar en nosotros y mucha suerte!</p>
              </section>

              <div className="modal-botones solo-enviar">
                <button
                  className="btn-enviar-modal"
                  onClick={handleConfirmarCompra}
                  disabled={enviando}
                >
                  {enviando ? 'Procesando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal final de compra confirmada */}
        {mostrarConfirmacionFinal && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h3>🎉 ¡Compra Confirmada!</h3>
              <p>Tu participación ha sido registrada exitosamente.</p>
              <p>Recibirás noticias del sorteo en las próximas 24 a 48 horas.</p>
              <p>Gracias por confiar en <strong>Número Dorado Club</strong>. ¡Mucha suerte! 🍀</p>
              <button className="btn-confirmar" onClick={() => router.push('/')}>
                Ir al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
