import type { Metadata } from 'next'
import { Geo, JetBrains_Mono, Space_Grotesk, Outfit, Urbanist, Plus_Jakarta_Sans, Albert_Sans, Josefin_Sans, Rubik, DM_Sans, Sora } from 'next/font/google'
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

// Test fonts for navbar
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'] })
const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'] })
const urbanist = Urbanist({ variable: '--font-urbanist', subsets: ['latin'] })
const plusJakarta = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta', subsets: ['latin'] })
const albertSans = Albert_Sans({ variable: '--font-albert-sans', subsets: ['latin'] })
const josefinSans = Josefin_Sans({ variable: '--font-josefin-sans', subsets: ['latin'] })
const rubik = Rubik({ variable: '--font-rubik', subsets: ['latin'] })
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'] })
const sora = Sora({ variable: '--font-sora', subsets: ['latin'] })

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geo.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${outfit.variable} ${urbanist.variable} ${plusJakarta.variable} ${albertSans.variable} ${josefinSans.variable} ${rubik.variable} ${dmSans.variable} ${sora.variable} antialiased`}>
        <CursorProvider>
          {children}
          <CursorWrapper />
        </CursorProvider>
        <Toaster />
      </body>
    </html>
  )
}
