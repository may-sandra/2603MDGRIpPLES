import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: any): string {
  if (value === null || value === undefined || value === '') return '0'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  // For very large numbers, show in millions/billions
  if (num >= 1000000) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B'
    }
    return (num / 1000000).toFixed(1) + 'M'
  }
  
  // Add comma separators for thousands
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  })
}
