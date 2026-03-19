// Format number with thousand separators
export const formatNumberWithCommas = (value: any): string => {
  if (typeof value === 'string') {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  }
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  }
  return String(value)
}

// Format number with abbreviations (B, M, K)
export const formatNumberWithAbbreviation = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toFixed(1)
}

// Format number with abbreviations AND commas in base number
export const formatNumberWithAbbreviationAndCommas = (value: number): string => {
  if (value >= 1000000000) {
    const abbreviated = (value / 1000000000).toFixed(1)
    return `${parseFloat(abbreviated).toLocaleString('en-US', { maximumFractionDigits: 1 })}B`
  }
  if (value >= 1000000) {
    const abbreviated = (value / 1000000).toFixed(1)
    return `${parseFloat(abbreviated).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`
  }
  if (value >= 1000) {
    const abbreviated = (value / 1000).toFixed(1)
    return `${parseFloat(abbreviated).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}
