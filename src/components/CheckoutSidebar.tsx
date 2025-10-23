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
    if (seleccionados.length < 2) {
      alert('⚠️ Debes seleccionar al menos 2 números para continuar con la compra.')
      return
    }

    localStorage.setItem('carritoNumeros', JSON.stringify(seleccionados))
    router.push('/checkout')
  }

  // 🔒 Deduplicar antes de renderizar
  const unicos = [...new Set(seleccionados)]

  return (
    <div className="checkout-sidebar">
      <div className="lineal">
        <h3 className="checkout-titulo">Tu Carrito</h3>
        <p className="checkout-cantidad">
          {unicos.length} número{unicos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {unicos.length === 0 ? (
        <p className="checkout-vacio">No has seleccionado ningún número.</p>
      ) : (
        <>
          <ul className="checkout-lista">
            {unicos.map((num) => (
              <li key={`num-${num}`} className="checkout-item">
                <span className="checkout-numero">#{num.toString().padStart(4, '0')}</span>
                <span className="checkout-precio">${precioPorNumero.toFixed(2)}</span>
                <button
                  className="btn-eliminar"
                  onClick={() => onRemove(num)}
                  title="Eliminar número"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          <div className="checkout-resumen">
            <div className="checkout-linea">
              <span>Subtotal:</span>
              <span>${(unicos.length * precioPorNumero).toFixed(2)}</span>
            </div>
            <div className="checkout-linea">
              <span>Precio por número:</span>
              <span>${precioPorNumero.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-botones">
            <button className="btn-pagar" onClick={handleCheckout}>
              Proceder al Pago
            </button>
            <button className="btn-limpiar" onClick={onRemoveAll}>
              Limpiar Carrito
            </button>
          </div>
        </>
      )}
    </div>
  )
}
