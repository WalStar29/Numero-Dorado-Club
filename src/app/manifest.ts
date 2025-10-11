import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 0

export default function manifest(): MetadataRoute.Manifest {
    return {
        short_name: 'Numero Dorado',
        name: 'Numero Dorado Club',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FFD700',
        icons: [
        {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
        },
        {
            src: '/logo.png',
            type: 'image/png',
            sizes: '192x192',
        },
        {
            src: '/logo.png',
            type: 'image/png',
            sizes: '512x512',
        },
        ],
    }
}
