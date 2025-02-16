'use client'
import _ from 'lodash'
import Link from 'next/link'
import { Lock, InfoIcon, Hotel } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

// import { Logo } from '@/components/icons'
export default function Header({}: {}) {
  const navItems = [
    {
      display: 'Home',
      href: '/',
    },
    {
      display: 'Projects',
      href: '/projects',
    },
    {
      display: 'Politon',
      href: '/politon',
    },
    {
      display: 'About',
      href: '/about',
    },
  ]
  return (
    <>
      <header className={`w-full h-36 flex flex-row items-center justify-center font-mono font-medium px-12 `}>
        <motion.div
          initial={{ width: 0 }}
          style={{ originX: 0 }}
          animate={{ width: '100%' }}
          exit={{ width: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.6, delay: 0.1 }}
          className='overflow-hidden pr-2 flex flex-row justify-between items-center  w-full max-w-7xl bg-slate-800 bg-opacity-60 backdrop-blur-lg rounded-full border-slate-900  shadow-lg'
        >
          <div className='flex flex-row items-center w-full overflow-hidden'>
            <div className='h-full p-2'>
              <Button variant={'ghost'} className='rounded-full p-8 h-full' asChild>
                <Link href='/'>
                  <Hotel />
                </Link>
              </Button>
            </div>
            <nav className='flex flex-row items-center p-6'>
              <ul className='flex flex-row items-center gap-8'>
                {navItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href}>
                      <div className=' hover:underline'>{item.display}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className='h-full p-2'>
            <Button className='rounded-full p-6 h-full'>Contact</Button>
          </div>
        </motion.div>
      </header>
    </>
  )
}
