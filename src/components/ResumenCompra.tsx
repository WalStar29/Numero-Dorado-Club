'use client'
import '@/styles/ResumenCompra.css'
import { MdShoppingCartCheckout } from 'react-icons/md'

type ResumenCompraProps = {
  seleccionados: number[]
  precioPorNumero: number
  premio: string
  fechaSorteo: string
  tasaCambio: number
}

export default function ResumenCompra({
  seleccionados,
  precioPorNumero,
  premio,
  fechaSorteo,
  tasaCambio,
}: ResumenCompraProps) {
  // 🔒 Deduplicar antes de renderizar
  const unicos = [...new Set(seleccionados)]

  const totalUSD = unicos.length * precioPorNumero
  const totalBs = totalUSD * tasaCambio

  if (unicos.length === 0) {
    return (
      <div className="mensaje-vacio">
        No has seleccionado ningún número.
      </div>
    )
  }

  return (
    <div className="form-compra">
      <div className="resumen-box">
        <img src="/trebol.svg" alt="" />
        <h3 className="titulo-dorado">
          <MdShoppingCartCheckout />Resumen de Compra
        </h3>
        <h4 className="subtitulo">Números seleccionados:</h4>
        <ul className="lista-numeros">
          {unicos.map((num) => (
            <li key={`num-${num}`} className="numero-item">
              <span className="numero">#{num.toString().padStart(4, '0')}</span>
              <span className="precio">${precioPorNumero.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="resumen-datos">
          <p><span>Cantidad de números:</span><span>{unicos.length}</span></p>
          <p><span>Precio por número:</span><span>${precioPorNumero.toFixed(2)}</span></p>
          <p><span>Total:</span><span>${totalUSD.toFixed(2)}</span></p>
          <p><span>Total en Bolívares:</span><span>Bs {totalBs.toFixed(2)}</span></p>
        </div>

        <div className="resumen-premio">
          <p><span>Premio:</span><span>{premio}</span></p>
          <p><span>Sorteo:</span><span>{fechaSorteo}</span></p>
        </div>
      </div>
    </div>
  )
}
