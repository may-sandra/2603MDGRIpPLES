'use client'

import React, { useEffect, useRef } from 'react'

export function ColorizedGHIMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create gradient for solar irradiance (yellow to red)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, '#ffeda0')    // Low
    gradient.addColorStop(0.25, '#fed976')
    gradient.addColorStop(0.5, '#feb24c')  // Moderate
    gradient.addColorStop(0.75, '#fd8d3c')
    gradient.addColorStop(1, '#800026')    // High

    // Draw gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add noise/texture to simulate satellite data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 30
      data[i] += noise     // R
      data[i + 1] += noise // G
      data[i + 2] -= noise // B
    }
    ctx.putImageData(imageData, 0, 0)

    // Add title
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'center'
    ctx.fillText('Global Horizontal Irradiance (kWh/m²/day)', canvas.width / 2, 30)
  }, [])

  return (
    <div className="w-full rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <canvas
        ref={canvasRef}
        className="w-full h-64 dark:opacity-90"
      />
      <div className="p-3 bg-yellow-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">Solar Irradiance Legend</p>
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
          <span>Low (2.5)</span>
          <span>Moderate (5.0)</span>
          <span>High (7.5+)</span>
        </div>
      </div>
    </div>
  )
}

export function ColorizedWindMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create gradient for wind speed (light to dark green)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, '#ffffcc')    // Low
    gradient.addColorStop(0.25, '#d9f0a3')
    gradient.addColorStop(0.5, '#78c679')  // Moderate
    gradient.addColorStop(0.75, '#41ab5d')
    gradient.addColorStop(1, '#003d0d')    // High

    // Draw gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add noise/texture to simulate satellite data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 25
      data[i] -= noise     // R
      data[i + 1] += noise // G
      data[i + 2] -= noise // B
    }
    ctx.putImageData(imageData, 0, 0)

    // Add title
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'center'
    ctx.fillText('Wind Speed at 100m Hub Height (m/s)', canvas.width / 2, 30)
  }, [])

  return (
    <div className="w-full rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <canvas
        ref={canvasRef}
        className="w-full h-64 dark:opacity-90"
      />
      <div className="p-3 bg-green-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">Wind Speed Legend (m/s)</p>
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
          <span>Low (2.0)</span>
          <span>Moderate (5.0)</span>
          <span>High (8.0+)</span>
        </div>
      </div>
    </div>
  )
}
