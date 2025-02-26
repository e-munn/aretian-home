'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Users, BarChart, Lock } from 'lucide-react';
import Link from 'next/link';
import Three from '@/components/curtain/three';
import CurtainMap from '@/components/curtain/map';
import Chart1 from './chart1';

export default function Curtain() {
  return (
    <>
      <div className='flex w-full flex-col items-center justify-start p-0'>
        <section className='w-full p-12  max-w-7xl'>
          {/* <Three /> */}

          <div className='relative bottom-0 left-0 z-50 w-full h-full pointer-events-none flex justify-center'>
            <div className='px-12 py-10 rounded-3xl w-full h-[500px] rounded-3xl bg-gradient-to-r from-blue-200 to-slate-200 shadow-lg'>
              <div className='w-full truncate text-slate-600 text-3xl font-extrabold flex flex-col gap-2'>
                <div className='text-4xl font-extrabold'>Aretian</div>
                <div>Urban Analytics and Design</div>
              </div>
              <div className='font-semibold text-slate-950 text-5xl w-full p-1 text-shadow-lg flex flex-col py-4'>
                <div
                  style={{
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    lineHeight: 1.1,
                  }}
                  className='py-8 font-semibold text-5xl bg-gradient-to-r from-blue-950 to-slate-900 text-3xl font-extrabold text-transparent bg-clip-text'
                >
                  A new scientific theory of cities to empower the next
                  generation of policy makers, <span>private firms,</span> and
                  city planners.
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <section className='w-full p-12  max-w-7xl'>
          <div className='w-full h-[600px] bg-gray-900 overflow-hidden rounded-3xl'></div>
        </section> */}

        <section className='w-full p-12  max-w-7xl'>
          <div className='w-full h-[300px] flex  gap-12'>
            <div className='w-1/2 h-full bg-slate-900 rounded-3xl overflow-hidden'>
              <Chart1 />
            </div>
            <div className='w-1/2 h-full border-2 border-slate-800 rounded-3xl bg-slate-900 overflow-hidden'>
              <div className='h-full w-full'>
                <CurtainMap />
              </div>
            </div>
          </div>
        </section>

        {/* <section className='w-full h-full p-8  max-w-7xl'>
          <div className='w-full min-h-96 bg-slate-900 border border-slate-800 shadow-lg rounded-3xl'></div>
        </section> */}
      </div>
    </>
  );
}
