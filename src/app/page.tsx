'use client'

import { useEffect } from 'react'
import PerkApp from '@/components/PerkApp'

export default function Page() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  return <PerkApp />
}
