import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { venta } = body

    if (!venta || !venta.correo) {
        return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
        }

        const listaNumeros = Array.isArray(venta.numeros)
        ? venta.numeros.map((n: string | number) => `#${n.toString().padStart(4, '0')}`).join(', ')
        : `#${venta.numero?.toString().padStart(4, '0')}`

        const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.CORREO_REMITENTE,
            pass: process.env.CLAVE_APP_GMAIL
        }
    })

    const mensaje = `
Hola ${venta.nombre},

Lamentamos informarte que tu compra en Número Dorado Club ha sido denegada.

🧾 Detalles de la solicitud:
- Teléfono: ${venta.telefono}
- Banco: ${venta.banco}
- Método de pago: ${venta.metodo}
- Monto: ${venta.monto || '—'}
- Números solicitados: ${listaNumeros}
- Referencia: ${venta.referencia}

Esto puede deberse a inconsistencias en el pago o a una validación fallida. Si crees que esto fue un error, por favor contáctanos para revisar tu caso.

Gracias por tu comprensión.

— El equipo de Número Dorado Club
    `

await transporter.sendMail({
        from: `"Número Dorado Club" <${process.env.CORREO_REMITENTE}>`,
        to: venta.correo,
        subject: '❌ Tu compra fue denegada',
        text: mensaje
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('❌ Error al enviar correo:', error?.message || error)
        return NextResponse.json({ error: error?.message || 'Error desconocido' }, { status: 500 })
    }
}

// Manejo explícito de GET para evitar error 405
export async function GET() {
    return NextResponse.json({ error: 'Método GET no permitido' }, { status: 405 })
}
