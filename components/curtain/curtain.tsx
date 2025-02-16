'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Users, BarChart, Lock } from 'lucide-react'
import Link from 'next/link'

export default function Curtain() {
  return (
    <>
      <div className='flex w-full h-full flex-col items-center justify-center p-6'>
        <section className='w-full h-full p-8  max-w-7xl'>
          <div className='w-full min-h-96 bg-slate-900 border border-slate-800 shadow-lg rounded-3xl'></div>
        </section>
      </div>
    </>
  )
}
