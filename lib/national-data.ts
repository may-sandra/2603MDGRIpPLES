// National baseline and target data for comparisons
export const nationalData = {
  categories: {
    "Energy Resource Potential": {
      baseline: {
        2019: { solar: 4.5, wind: 2.1, biomass: 15.3, hydro: 8.2, geothermal: 3.8 },
        2020: { solar: 4.6, wind: 2.2, biomass: 15.5, hydro: 8.3, geothermal: 3.9 },
        2021: { solar: 4.8, wind: 2.3, biomass: 16.1, hydro: 8.5, geothermal: 4.1 },
        2022: { solar: 5.1, wind: 2.5, biomass: 16.8, hydro: 8.7, geothermal: 4.3 },
        2023: { solar: 5.3, wind: 2.7, biomass: 17.2, hydro: 9.0, geothermal: 4.5 },
        2024: { solar: 5.6, wind: 2.9, biomass: 17.8, hydro: 9.2, geothermal: 4.7 },
      },
      targets: {
        2025: { solar: 6.0, wind: 3.2, biomass: 18.5, hydro: 9.5, geothermal: 5.0 },
        2030: { solar: 8.5, wind: 4.8, biomass: 22.0, hydro: 11.0, geothermal: 6.5 },
      },
      unit: "GW",
    },
    "Infrastructure & Access": {
      baseline: {
        2019: { gridConnectivity: 65.3, miniGrids: 3.2, offGrid: 8.5, standalone: 23.0 },
        2020: { gridConnectivity: 66.1, miniGrids: 3.8, offGrid: 9.2, standalone: 22.9 },
        2021: { gridConnectivity: 67.2, miniGrids: 4.5, offGrid: 10.1, standalone: 22.2 },
        2022: { gridConnectivity: 68.5, miniGrids: 5.3, offGrid: 11.0, standalone: 21.2 },
        2023: { gridConnectivity: 69.8, miniGrids: 6.2, offGrid: 11.8, standalone: 20.2 },
        2024: { gridConnectivity: 71.2, miniGrids: 7.1, offGrid: 12.5, standalone: 19.2 },
      },
      targets: {
        2025: { gridConnectivity: 72.5, miniGrids: 8.0, offGrid: 13.2, standalone: 18.3 },
        2030: { gridConnectivity: 85.0, miniGrids: 12.5, offGrid: 18.0, standalone: 10.5 },
      },
      unit: "%",
    },
    "Energy Demand & Consumption": {
      baseline: {
        2019: { household: 45.2, industrial: 38.5, commercial: 12.1, public: 4.2 },
        2020: { household: 44.8, industrial: 39.2, commercial: 12.5, public: 4.3 },
        2021: { household: 45.1, industrial: 40.1, commercial: 12.8, public: 4.5 },
        2022: { household: 45.5, industrial: 41.2, commercial: 13.2, public: 4.6 },
        2023: { household: 46.2, industrial: 42.1, commercial: 13.5, public: 4.8 },
        2024: { household: 47.0, industrial: 43.2, commercial: 13.8, public: 5.0 },
      },
      targets: {
        2025: { household: 48.0, industrial: 44.5, commercial: 14.2, public: 5.3 },
        2030: { household: 52.0, industrial: 48.0, commercial: 16.0, public: 6.0 },
      },
      unit: "TWh",
    },
  },
}

export function getNationalYearlyData(category: string, year: number | string): Record<string, number> {
  const yearStr = year.toString()
  const categoryData = nationalData.categories[category as keyof typeof nationalData.categories]
  if (!categoryData) return {}

  if (yearStr in categoryData.baseline) {
    return categoryData.baseline[yearStr as keyof typeof categoryData.baseline] || {}
  }
  if (yearStr in categoryData.targets) {
    return categoryData.targets[yearStr as keyof typeof categoryData.targets] || {}
  }
  return {}
}

export function getAllYearsData(category: string) {
  const categoryData = nationalData.categories[category as keyof typeof nationalData.categories]
  if (!categoryData) return []

  const years = [...Object.keys(categoryData.baseline), ...Object.keys(categoryData.targets)].map(Number).sort()
  return years.map((year) => ({
    year,
    ...(getNationalYearlyData(category, year) || {}),
  }))
}
