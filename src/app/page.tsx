'use client'

// This is your main app entry point.
// The full UI lives in PerkApp — paste your perk-app.jsx component here,
// or import it once you've split it into separate component files.

// For now this imports the monolithic component as-is:
import PerkApp from '@/components/PerkApp'

export default function Page() {
  return <PerkApp />
}
