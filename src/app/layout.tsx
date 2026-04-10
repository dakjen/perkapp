import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'perk.',
  description: 'Benefits for every team.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'perk.',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'perk.',
    description: 'Benefits for every team.',
  },
}

export const viewport: Viewport = {
  themeColor: '#5C6B2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,300;1,8..60,400&display=swap" rel="stylesheet"/>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F5F2EC', fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {children}
      </body>
    </html>
  )
}
