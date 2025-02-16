'use client'
import { useSessionStorage } from 'usehooks-ts'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import Footer from '@/components/head/footer'
import { useEffect, useState } from 'react'
import Curtain from '@/components/curtain/curtain'
export default function Index() {
  return (
    <>
      <div className='h-screen  w-full' suppressHydrationWarning>
        <Curtain />
      </div>
    </>
  )
}
