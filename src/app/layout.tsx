import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import LoaderWrapper from '@/components/LoaderWrapper'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Numero Dorado Club',
  description: 'Participa por el iPhone 15 Pro Max en el sorteo más confiable de Venezuela.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/trebol.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Participa en sorteo más confiable de Venezuela." />
        <title>Numero Dorado Club</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LoaderWrapper>
          {children}
        </LoaderWrapper>
      </body>
    </html>
  )
}
