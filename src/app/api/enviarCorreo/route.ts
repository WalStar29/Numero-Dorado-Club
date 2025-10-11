// src/app/api/enviarCorreo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    const { venta } = await req.json()

    if (!venta || !venta.correo) {
        return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const listaNumeros = Array.isArray(venta.numeros)
        ? venta.numeros.map((n: string | number) => `#${n.toString().padStart(4, '0')}`).join(', ')
        : `#${venta.numero?.toString().padStart(4, '0')}`

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.CORREO_REMITENTE,
        pass: process.env.CLAVE_APP_GMAIL
        }
    })

    const mensaje = `
    Hola ${venta.nombre},

    🎉 Gracias por tu compra en *Número Dorado Club*

    🧾 Detalles de tu compra:
    - Teléfono: ${venta.telefono}
    - Banco: ${venta.banco}
    - Método de pago: ${venta.metodo}
    - Monto: ${venta.monto || '—'}
    - Números asignados: ${listaNumeros}
    - Referencia: ${venta.referencia}

    Si tienes alguna duda, estamos aquí para ayudarte.

    — El equipo de Número Dorado Club
    `

    try {
        await transporter.sendMail({
        from: `"Número Dorado Club" <${process.env.CORREO_REMITENTE}>`,
        to: venta.correo,
        subject: '✅ Confirmación de tu compra',
        text: mensaje
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('❌ Error al enviar correo:', error)
        return NextResponse.json({ error: 'Error al enviar correo' }, { status: 500 })
    }
}
