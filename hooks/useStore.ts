import { create } from 'zustand'

export const useStore = create((set) => ({
  update: 0,
  setUpdate: (newUpdate: any) => set((state: any) => ({ update: newUpdate })),
}))
