import { useEffect } from 'react'

export default function QuantumLoader({ color }: { color: string }) {
  useEffect(() => {
    async function getLoader() {
      const { quantum } = await import('ldrs')
      quantum.register()
    }
    getLoader()
  }, [])
  return <l-quantum size="45" speed="1.75" color={color}></l-quantum>
}
