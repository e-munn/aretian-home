import { useEffect } from 'react'

export default function SpinLoader({ color }: { color: string }) {
  useEffect(() => {
    async function getLoader() {
      const { lineSpinner } = await import('ldrs')
      lineSpinner.register()
    }
    getLoader()
  }, [])
  return <l-line-spinner size="32" stroke="3" speed="1" color={color}></l-line-spinner>
}
