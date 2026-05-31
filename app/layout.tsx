import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Kya Banana Hai',
  description: 'Tell your cook exactly what to make',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-orange-50 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
