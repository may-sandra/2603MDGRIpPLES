export interface CountyMap {
  title: string
  description: string
  imagePath: string
  type: 'context' | 'solar' | 'electricity' | 'wind' | 'facilities' | 'other'
}

export interface CountyMapsData {
  [county: string]: CountyMap[]
}

export const countyMapsData: CountyMapsData = {
  Nyandarua: [
    {
      title: 'County Context',
      description: 'Administrative boundaries showing sub-counties, wards, and roads classification',
      imagePath: '/county-maps/nyandarua-context.png',
      type: 'context',
    },
    {
      title: 'Solar Irradiance',
      description: 'Solar energy potential distribution across the county',
      imagePath: '/county-maps/kilifi-solar-irradiance.png',
      type: 'solar',
    },
    {
      title: 'Electricity Access',
      description: 'Population clusters and electrification status across localities',
      imagePath: '/county-maps/nyandarua-electricity-access.png',
      type: 'electricity',
    },
    {
      title: 'Wind Speed',
      description: 'Wind resource potential (0.2-7.68 m/s) for energy generation',
      imagePath: '/county-maps/nyandarua-wind-speed.png',
      type: 'wind',
    },
    {
      title: 'Education Facilities',
      description: 'Distribution of educational institutions with electricity connectivity',
      imagePath: '/county-maps/nyandarua-education-facilities.png',
      type: 'facilities',
    },
    {
      title: 'Health Facilities',
      description: 'Healthcare facility locations and electrification status',
      imagePath: '/county-maps/nyandarua-health-facilities.png',
      type: 'facilities',
    },
  ],
  Kilifi: [
    {
      title: 'County Context',
      description: 'Administrative boundaries and geographic context',
      imagePath: '/county-maps/kilifi-context.png',
      type: 'context',
    },
    {
      title: 'Solar Irradiance',
      description: 'Solar irradiance heat map (600-2400 kWh/m²) for Kilifi County',
      imagePath: '/county-maps/kilifi-solar-irradiance.png',
      type: 'solar',
    },
    {
      title: 'Electricity Access',
      description: 'Population electrification status and infrastructure',
      imagePath: '/county-maps/kilifi-electricity-access.png',
      type: 'electricity',
    },
    {
      title: 'Wind Speed',
      description: 'Wind energy resources at 50m height (0.3-7.85 m/s)',
      imagePath: '/county-maps/kilifi-wind-speed.png',
      type: 'wind',
    },
    {
      title: 'Education Facilities',
      description: 'Educational institutions distribution',
      imagePath: '/county-maps/kilifi-education-facilities.png',
      type: 'facilities',
    },
    {
      title: 'Health Facilities',
      description: 'Healthcare facilities and electricity access',
      imagePath: '/county-maps/kilifi-health-facilities.png',
      type: 'facilities',
    },
  ],
  Kiambu: [
    {
      title: 'County Context',
      description: 'Administrative boundaries and geographic context',
      imagePath: '/county-maps/kiambu-context.png',
      type: 'context',
    },
    {
      title: 'Solar Irradiance',
      description: 'Solar energy potential distribution',
      imagePath: '/county-maps/kiambu-solar-irradiance.png',
      type: 'solar',
    },
    {
      title: 'Electricity Access',
      description: 'Population electrification status',
      imagePath: '/county-maps/kiambu-electricity-access.png',
      type: 'electricity',
    },
    {
      title: 'Wind Speed',
      description: 'Wind energy resources',
      imagePath: '/county-maps/kiambu-wind-speed.png',
      type: 'wind',
    },
    {
      title: 'Education Facilities',
      description: 'Educational institutions distribution',
      imagePath: '/county-maps/kiambu-education-facilities.png',
      type: 'facilities',
    },
    {
      title: 'Health Facilities',
      description: 'Healthcare facilities distribution',
      imagePath: '/county-maps/kiambu-health-facilities.png',
      type: 'facilities',
    },
  ],
}
