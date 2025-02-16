import { useEffect } from 'react'

export default function GridLoader({ color }: { color: string }) {
  useEffect(() => {
    async function getLoader() {
      const { grid } = await import('ldrs')
      grid.register()
    }
    getLoader()
  }, [])
  return <l-grid size='45' speed='1.75' color={color}></l-grid>
}
