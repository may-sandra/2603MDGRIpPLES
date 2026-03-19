import { cache } from "react"

export interface Feature {
  type: string
  id: string
  properties: {
    name: string
    [key: string]: any
  }
  geometry: {
    type: string
    coordinates: any
  }
}

export interface FeatureCollection {
  type: string
  features: Feature[]
}

// Convert TopoJSON arcs to GeoJSON coordinates
function arcToCoordinates(arcs: number[][], arcIndices: number[]): number[][][] {
  const coordinates: number[][][] = []
  const currentPath: number[][] = []

  for (const arcIndex of arcIndices) {
    const arc = arcs[Math.abs(arcIndex)]
    if (!arc) continue

    const reversed = arcIndex < 0

    let x = 0
    let y = 0
    const points: number[][] = []

    for (const [dx, dy] of arc) {
      x += dx
      y += dy
      points.push([x, y])
    }

    if (reversed) {
      points.reverse()
    }

    currentPath.push(...points)
  }

  if (currentPath.length > 0) {
    coordinates.push(currentPath)
  }

  return coordinates
}

// Transform scale and translate TopoJSON to actual coordinates
function transformCoordinates(coords: number[][][], transform: any): number[][][] {
  const { scale, translate } = transform
  const [scaleX, scaleY] = scale
  const [transX, transY] = translate

  return coords.map((polygon) => polygon.map(([x, y]) => [x * scaleX + transX, y * scaleY + transY]))
}

// Fallback sample data for Kenya counties
const FALLBACK_TOPOLOGY = {
  type: "Topology",
  objects: {
    counties: {
      type: "GeometryCollection",
      geometries: [
        { type: "Polygon", properties: { "First country": "Kilifi" }, arcs: [[0, 1, 2]] },
        { type: "Polygon", properties: { "First country": "Kitui" }, arcs: [[3, 4, 5]] },
        { type: "Polygon", properties: { "First country": "Kiambu" }, arcs: [[6, 7, 8]] },
        { type: "Polygon", properties: { "First country": "Nyandarua" }, arcs: [[9, 10, 11]] },
      ],
    },
  },
  arcs: [
    // Kilifi - coastal east
    [
      [453823, 41304],
      [-55, 14],
      [-105, 10],
      [-155, 10],
    ],
    [
      [453508, 41338],
      [-208, -13],
      [-8, -1],
    ],
    [
      [453292, 41324],
      [-227, -55],
      [-251, -44],
    ],
    // Kitui - southeast
    [
      [680, 400],
      [750, 420],
      [760, 550],
      [700, 580],
      [680, 500],
    ],
    [
      [700, 580],
      [760, 550],
      [750, 420],
    ],
    [
      [680, 400],
      [680, 500],
      [700, 580],
    ],
    // Kiambu - central
    [
      [520, 240],
      [620, 280],
      [620, 350],
      [560, 380],
      [520, 300],
    ],
    [
      [620, 280],
      [620, 350],
      [560, 380],
    ],
    [
      [520, 240],
      [520, 300],
      [560, 380],
    ],
    // Nyandarua - northwest
    [
      [420, 220],
      [520, 240],
      [520, 300],
      [460, 340],
    ],
    [
      [520, 240],
      [520, 300],
      [460, 340],
    ],
    [
      [420, 220],
      [460, 340],
      [520, 240],
    ],
  ],
  transform: {
    scale: [0.036003600360036, 0.017595307265829],
    translate: [23.358288, -4.678057],
  },
}

export const getKenyaCountiesGeoJson = cache(async (): Promise<Record<string, any>> => {
  try {
    // Try to load from public folder
    const response = await fetch("/kenya-counties.json", { next: { revalidate: 3600 } })
    if (!response.ok) throw new Error("Failed to fetch")
    const topoData = await response.json()
    return processTopoData(topoData)
  } catch (error) {
    console.warn("Could not load kenya-counties.json, using fallback data")
    return processTopoData(FALLBACK_TOPOLOGY)
  }
})

function processTopoData(topoData: any): Record<string, any> {
  if (!topoData.objects || !topoData.objects.counties) {
    console.warn("Invalid TopoJSON structure")
    return {}
  }

  const countyFeatures: Record<string, any> = {}
  const counties = topoData.objects.counties.geometries

  counties.forEach((geometry: any, idx: number) => {
    const countyName = geometry.properties?.["First country"] || `County ${idx}`

    if (geometry.type === "Polygon" && geometry.arcs && geometry.arcs[0]) {
      try {
        const coordinates = arcToCoordinates(topoData.arcs, geometry.arcs[0])
        const transformed = transformCoordinates(coordinates, topoData.transform)
        countyFeatures[countyName] = {
          type: "Polygon",
          coordinates: transformed,
        }
      } catch (e) {
        console.warn(`Error processing ${countyName}:`, e)
      }
    }
  })

  return countyFeatures
}

export function getCountyBounds(coordinates: number[][][]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY

  coordinates.forEach((polygon) => {
    polygon.forEach(([x, y]) => {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })
  })

  return { minX, maxX, minY, maxY }
}
