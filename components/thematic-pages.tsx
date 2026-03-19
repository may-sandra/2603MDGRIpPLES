'use client'

import CountiesComparisonPage from './counties-comparison-page'

interface ThematicPagesProps {
  selectedCounty: string | null
  onCountyChange: (county: string | null) => void
}

export default function ThematicPages({ selectedCounty, onCountyChange }: ThematicPagesProps) {
  return <CountiesComparisonPage selectedCounty={selectedCounty} />
}
