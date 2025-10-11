'use client'
import { FaTrash } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import '@/styles/CheckoutSidebar.css'

type CheckoutSidebarProps = {
  seleccionados: number[]
  onRemove: (num: number) => void
  onRemoveAll: () => void
}

export default function CheckoutSidebar({
  seleccionados,
  onRemove,
  onRemoveAll,
}: CheckoutSidebarProps) {
  const router = useRouter()
  const precioPorNumero = 1.0
  const total = seleccionados.length * precioPorNumero

  const handleCheckout = () => {
    localStorage.setItem('carritoNumeros', JSON.stringify(seleccionados))
    router.push('/checkout')
  }

  return (
    <div className="checkout-sidebar">
      <div className="lineal">
        <h3 className="checkout-titulo">Tu Carrito</h3>
        <p className="checkout-cantidad">
          {seleccionados.length} número{seleccionados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {seleccionados.length === 0 ? (
        <p className="checkout-vacio">No has seleccionado ningún número.</p>
      ) : (
        <>
          <ul className="checkout-lista">
            {seleccionados.map((num) => (
              <li key={num} className="checkout-item">
                <span className="checkout-numero">#{num.toString().padStart(3, '0')}</span>
                <span className="checkout-precio">${precioPorNumero.toFixed(2)}</span>
                <button className="btn-eliminar" onClick={() => onRemove(num)} title="Eliminar número">
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          <div className="checkout-resumen">
            <div className="checkout-linea">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="checkout-linea">
              <span>Precio por número:</span>
              <span>${precioPorNumero.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-botones">
            <button className="btn-pagar" onClick={handleCheckout}>Proceder al Pago</button>
            <button className="btn-limpiar" onClick={onRemoveAll}>Limpiar Carrito</button>
          </div>
        </>
      )}
    </div>
  )
}
