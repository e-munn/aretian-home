import type { Metadata } from 'next'
import { Geo, JetBrains_Mono, Albert_Sans, Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { CursorProvider } from '@/components/cursor/CursorProvider'
import CursorWrapper from '@/components/cursor/CursorWrapper'

const geo = Geo({
  weight: '400',
  variable: '--font-geo',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

const albertSans = Albert_Sans({ variable: '--font-albert-sans', subsets: ['latin'] })
const bebasNeue = Bebas_Neue({ weight: '400', variable: '--font-bebas-neue', subsets: ['latin'] })
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aretian | Urban Analytics and Design',
  description: 'Urban analytics and design for smarter, more sustainable cities.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.className} ${geo.variable} ${jetbrainsMono.variable} ${albertSans.variable} ${bebasNeue.variable} ${inter.variable} antialiased`}>
        <CursorProvider>
          {children}
          <CursorWrapper />
        </CursorProvider>
        <Toaster />
      </body>
    </html>
  )
}
