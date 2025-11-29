'use client'
import { useState } from 'react'
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import Navbar from '@/components/Navbar'
import PremioCard from '@/components/PremioCard'
import NumeroGrid from '@/components/NumeroGrid'
import CheckoutSidebar from '@/components/CheckoutSidebar'
import '@/styles/Home.css'

function TerminosModal({ onAccept }: { onAccept: () => void }) {
  const [aceptado, setAceptado] = useState(false)

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">📜 Términos y Condiciones</h2>

        <div className="modal-scroll">
          <h2>REGLAMENTO DE NORMAS Y CONDICIONES PARA LA REALIZACIÓN DE RIFAS DE NUMERO DORADO CLUB</h2>

          <p><strong>TÍTULO I: DISPOSICIONES FUNDAMENTALES</strong></p>
          <p><strong>Artículo 1. Objeto y Fundamento Legal.</strong> El presente Reglamento tiene por objeto establecer las normas, bases, procedimientos y condiciones generales que rigen la organización, promoción, realización y fiscalización de las rifas efectuadas por NUMERO DORADO CLUB, en estricto cumplimiento con la Ley Nacional de Loterías, su Reglamento y las disposiciones normativas emanadas de la Comisión Nacional de Loterías (CONALOT).</p>
          <p><strong>Artículo 2. Ámbito de Aplicación.</strong> Las presentes Normas y Condiciones serán de aplicación obligatoria para todas las rifas organizadas por NUMERO DORADO CLUB en el territorio de la República Bolivariana de Venezuela.</p>
          <p><strong>Artículo 3. Aceptación de las Normas.</strong> La adquisición de cualquier ticket para participar en los eventos de rifa realizadas por Número Dorado Club implica la aceptación plena de las disposiciones contenidas en este Reglamento.</p>

          <p><strong>TÍTULO II: DE LA ORGANIZACIÓN Y REALIZACIÓN</strong></p>
          <p><strong>Artículo 4. Autorización y Fiscalización.</strong> Toda rifa que se realice deberá contar previamente con la debida Autorización de la CONALOT y/o de los entes competentes, y se llevará a cabo bajo la fiscalización de los mismos a los fines de garantizar la legalidad y transparencia del proceso.</p>
          <p><strong>Artículo 5. Bases Específicas de la rifa.</strong> Para cada rifa sea ordinaria o especial, se elaborará unas Bases Específicas, que serán publicadas y/o impresas. Dichas Bases especificarán, al menos:</p>
          <ul>
            <li>a. Descripción exacta del Premio o Premios.</li>
            <li>b. Precio de venta del ticket.</li>
            <li>c. Mecanismo específico de selección del ganador.</li>
            <li>d. Fecha de la rifa</li>
          </ul>
          <p><strong>Artículo 6. Del Comprobante de Participación Digital.</strong></p>
          <ul>
            <li>6.1. La participación en la rifa se considerará válida únicamente después de que el pago del participante sea verificado por la administración de Número Dorado Club.</li>
            <li>6.2. Una vez verificado el pago, se generará un comprobante de participación digital, el cual será enviado al correo electrónico registrado por el participante y/o se reflejará de forma permanente en su cuenta de usuario dentro de la PWA.</li>
            <li>6.3. Este comprobante digital es el "ticket" oficial para todos los efectos legales y deberá contener, de forma clara y legible, la siguiente información esencial:</li>
            <ul>
              <li>a. El nombre del premio principal de la rifa.</li>
              <li>b. El (los) número(s) o código(s) de participación asignados.</li>
              <li>c. El precio pagado por la participación.</li>
              <li>d. La fecha, hora y método de realización de la rifa.</li>
            </ul>
          </ul>
          <p><strong>Artículo 7. Modificación, Suspensión o Postergación.</strong> Se reserva el derecho de modificar la fecha de la rifa solo por causas de fuerza mayor o caso fortuito debidamente justificados con previo aviso.</p>

          <p><strong>TÍTULO III: DE LOS PARTICIPANTES Y PREMIOS</strong></p>
          <p><strong>Artículo 8. Condiciones de Participación.</strong> Podrán participar todas las personas naturales o jurídicas que adquieran válidamente un ticket y cumplan con las condiciones establecidas en las Bases Específicas. Estará prohibida la participación de menores de edad.</p>
          <p><strong>Artículo 9. De los Premios, Canje y Entrega.</strong></p>
          <ul>
            <li>9.1. El Premio a entregar será el descrito y publicitado en las Bases Específicas. Como regla general, el Premio es intransferible y solo será entregado al titular de la cuenta registrada como ganador, previa validación de su identidad.</li>
            <li>9.2. Del Canje por Efectivo: En ningún caso, el ganador tendrá derecho a exigir el canje del premio por su valor equivalente en dinero en efectivo. Excepcionalmente, dicho canje solo podrá realizarse si existe un acuerdo voluntario, mutuo y por escrito entre el ganador y la administración de Número Dorado Club, quedando esta última libre de aceptar o rechazar dicha negociación.</li>
            <li>9.3. De la Entrega a Terceros: En casos excepcionales, el ganador podrá autorizar a una tercera persona para que reciba el premio en su nombre. Para que esta autorización sea válida, el ganador deberá consignar los siguientes recaudos:</li>
            <ul>
              <li>Una (1) Autorización por escrito donde consten sus datos de identidad, los datos de la persona autorizada y los detalles del premio, con su firma autenticada ante una notaría pública.</li>
              <li>Copia de la Cédula de Identidad del Ganador.</li>
              <li>Copia de la Cédula de Identidad de la persona autorizada.</li>
              <li>Un video breve del ganador confirmando la autorización.</li>
            </ul>
            <li>9.3.1. Al hacer uso de esta opción, el ganador asume total responsabilidad por la elección de su autorizado. Número Dorado Club queda exenta de cualquier disputa o reclamo que pueda surgir entre el ganador y la persona autorizada. Una vez que el premio sea entregado al portador de la autorización autenticada, la obligación de Número Dorado Club se considerará cumplida.</li>
          </ul>
          <p><strong>Artículo 10. Reclamo de Premios.</strong> El ganador deberá contactar a Número Dorado Club y coordinar su presentación en el lugar y horario indicados, dentro de un plazo perentorio de treinta (30) días hábiles a partir de la fecha de la rifa. Para reclamar, el ganador deberá presentar indispensablemente:</p>
          <ul>
            <li>Su Documento de Identidad (Cédula o Pasaporte) original y vigente, el cual debe coincidir con los datos registrados en la plataforma.</li>
            <li>El comprobante de participación digital (ticket), sea mostrándolo desde su correo electrónico de confirmación o desde su cuenta de usuario en la PWA de Número Dorado Club.</li>
          </ul>
          <p>El incumplimiento de este plazo o de estos requisitos implica la pérdida del derecho al reclamo.</p>
          <p><strong>Artículo 11. Prescripción.</strong> Si el premio no es reclamado en el plazo establecido, el derecho del ganador a reclamarlo prescribirá, y Número Dorado Club dispondrá del mismo conforme a lo establecido en la Ley Nacional de Loterías y las directrices de la CONALOT.</p>
          <p><strong>Artículo 12. Carga Impositiva y Gastos.</strong> Todos los impuestos, tasas, gravámenes o gastos derivados de la obtención y legalización del premio serán asumidos en su totalidad por el ganador. Esto incluye, de forma enunciativa pero no limitativa, cualquier costo asociado a registro, traspaso, seguro, gestoría o transporte del bien.</p>

          <p><strong>TÍTULO IV: DISPOSICIONES FINALES</strong></p>
          <p><strong>Artículo 13. Interpretación y Jurisdicción.</strong> Cualquier situación no prevista en este Reglamento se resolverá de conformidad con lo establecido en las Bases Específicas de la rifa y, en su defecto, por las disposiciones de la Ley Nacional de Loterías, su Reglamento y las decisiones de la CONALOT.</p>
          <p><strong>Artículo 14. Domicilio Legal.</strong> A todos los efectos legales y para la solución de controversias, las partes eligen como domicilio legal la ciudad de Porlamar, estado Nueva Esparta y se someten a la jurisdicción de sus tribunales competentes, previo el agotamiento de la vía administrativa ante la CONALOT.</p>
        </div>
        
        <div className="modal-actions">
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={aceptado}
              onChange={() => setAceptado(!aceptado)}
            />
            <span>He leído y acepto los Términos y Condiciones</span>
          </label>

          <button
            onClick={() => aceptado && onAccept()}
            disabled={!aceptado}
            className={`modal-button ${aceptado ? 'active' : 'disabled'}`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [aceptoTerminos, setAceptoTerminos] = useState(false)

  // 🔎 Estados para el modal de verificación
  const [cedulaInput, setCedulaInput] = useState('')
  const [ventaEncontrada, setVentaEncontrada] = useState<any | null>(null)
  const [isOpen, setIsOpen] = useState(false)

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

  // 📌 Buscar venta por cédula en Firestore
  const buscarPorCedula = async () => {
    try {
      const snap = await getDocs(collection(db, 'ventasRegistradas'))
      const ventas = snap.docs.map(d => d.data())
      const venta = ventas.find(v => v.cedula === cedulaInput.trim())
      setVentaEncontrada(venta || null)
      setIsOpen(true)
    } catch (error) {
      console.error('Error buscando por cédula:', error)
    }
  }
  
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {!aceptoTerminos && (
        <TerminosModal onAccept={() => setAceptoTerminos(true)} />
      )}

      {aceptoTerminos && (
        <>
          <section className="max-w-6xl mx-auto px-4 py-10">
            <PremioCard />

            {/* 🔎 Botón debajo de PremioCard */}
            <div className="btn-wrapper">
              <button
                onClick={() => setIsOpen(true)}
                className="btn-verificar"
              >
                Verificar número
              </button>
            </div>
          </section>

          <section className="layout-grid">
            <div className="numero-grid-wrapper">
              <NumeroGrid
                seleccionados={seleccionados}
                setSeleccionados={setSeleccionados}
              />
            </div>

            <div className="checkout-sidebar-wrapper">
              <CheckoutSidebar
                seleccionados={seleccionados}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
              />
            </div>
          </section>

          {/* 🪟 Modal de verificación */}
          {isOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Verificar Cliente</h3>
                <input
                  type="text"
                  placeholder="Ingrese la cédula"
                  value={cedulaInput}
                  onChange={(e) => setCedulaInput(e.target.value)}
                />

                <div className="modal-actions">
                  <button onClick={buscarPorCedula} className="bg-green-600">
                    Buscar
                  </button>
                  <button onClick={() => setIsOpen(false)} className="close-btn">
                    Cerrar
                  </button>
                </div>

                {ventaEncontrada ? (
                  <div className="venta-info mt-2">
                    <p><strong>Nombre:</strong> {ventaEncontrada.nombre} {ventaEncontrada.apellido}</p>
                    <p><strong>Cédula:</strong> {ventaEncontrada.cedula}</p>
                    <p><strong>Números comprados:</strong></p>
                    <div className="numeros-list">
                      {ventaEncontrada.numeros?.length
                        ? ventaEncontrada.numeros.map((num, idx) => (
                            <span key={idx} className="numero-badge">{num}</span>
                          ))
                        : <span className="numero-badge">{ventaEncontrada.numero}</span>
                      }
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-600">
                    ⚠️ No se encontró ninguna venta con esa cédula.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}