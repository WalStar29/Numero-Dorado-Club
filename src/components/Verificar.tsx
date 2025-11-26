'use client'

function Verificar() {
    const handleVerificar = () => {
        const seleccionados = JSON.parse(localStorage.getItem('carritoNumeros') || '[]')
        console.log('Números seleccionados:', seleccionados)
    }

    return (
        <div>
            <button onClick="hanleVerificar">Verificar numeros</button>
        </div>
    )
}

export default Verificar