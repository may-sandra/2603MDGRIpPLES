// County-specific resource maps and thematic visualizations
export interface CountyMap {
  title: string
  description: string
  imageUrl: string
  mapType: 'solar' | 'wind' | 'biomass' | 'resource' | 'energy' | 'other'
}

export interface CountyMapsCollection {
  [county: string]: CountyMap[]
}

export const countyMaps: CountyMapsCollection = {
  Kilifi: [
    {
      title: 'Global Horizontal Irradiation',
      description: 'Solar irradiation potential across Kilifi County showing energy intensity levels (kWh/m²/day)',
      imageUrl: '/maps/kilifi-solar-irradiation.png',
      mapType: 'solar',
    },
    {
      title: 'Wind Energy Resources',
      description: 'Wind speed distribution across Kilifi County at 50m height showing variable resource potential (m/s)',
      imageUrl: '/maps/kilifi-wind-resources.png',
      mapType: 'wind',
    },
  ],
  Kitui: [],
  Kiambu: [],
  Nyandarua: [],
}

export function getCountyMaps(county: string): CountyMap[] {
  return countyMaps[county] || []
}

export function hasCountyMaps(county: string): boolean {
  return getCountyMaps(county).length > 0
}
