import type { Metadata } from 'next'
import { JetBrains_Mono, Merriweather } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/head/header'

const mono = JetBrains_Mono({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-mono',
})

const serif = Merriweather({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Aretian',
  description: '',
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
      <body className={`${mono.variable} ${serif.variable} antialiased`}>
        <Header />
        <main className=''>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
