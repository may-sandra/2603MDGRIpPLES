// Dummy data for energy exploration and visualization
export const dummyEnergyStats = {
  solar: {
    avgPotential: 5.2,
    unitsPerCounty: "kWh/m²/day",
    countiesExplored: 14,
    topCounties: ["Turkana", "Samburu", "Isiolo", "Laikipia", "Kajiado"],
  },
  wind: {
    avgPotential: 6.8,
    unitsPerCounty: "m/s @ 50m",
    countiesExplored: 8,
    topCounties: ["Turkana", "West Pokot", "Samburu", "Wajir", "Marsabit"],
  },
  biomass: {
    avgPotential: 150000,
    unitsPerCounty: "tonnes/year",
    countiesExplored: 20,
    topCounties: ["Kisii", "Nyamira", "Bungoma", "Kakamega", "Kericho"],
  },
  hydro: {
    avgPotential: 45,
    unitsPerCounty: "MW Potential",
    countiesExplored: 12,
    topCounties: ["Nyeri", "Kirinyaga", "Embu", "Tana River", "West Pokot"],
  },
  electricity: {
    gridConnection: 68,
    miniGrids: 45,
    offGrid: 32,
    unitsPercentage: "%",
  },
}

// Bar chart data for renewable energy by sector
export const renewableEnergyByCounty = [
  { county: "Turkana", solar: 5.8, wind: 8.2, biomass: 85000, hydro: 15 },
  { county: "Samburu", solar: 5.4, wind: 7.1, biomass: 62000, hydro: 8 },
  { county: "Isiolo", solar: 5.3, wind: 6.5, biomass: 72000, hydro: 12 },
  { county: "Kajiado", solar: 5.6, wind: 5.8, biomass: 58000, hydro: 5 },
  { county: "Laikipia", solar: 5.2, wind: 6.2, biomass: 95000, hydro: 25 },
  { county: "Kisii", solar: 4.1, wind: 3.2, biomass: 185000, hydro: 42 },
  { county: "Nyamira", solar: 3.9, wind: 2.8, biomass: 168000, hydro: 38 },
]

// Electricity access progression over time
export const electricityAccessTrend = [
  { year: 2019, gridConnection: 48, miniGrids: 12, offGrid: 40 },
  { year: 2020, gridConnection: 52, miniGrids: 18, offGrid: 30 },
  { year: 2021, gridConnection: 56, miniGrids: 25, offGrid: 19 },
  { year: 2022, gridConnection: 61, miniGrids: 32, offGrid: 7 },
  { year: 2023, gridConnection: 65, miniGrids: 40, offGrid: -5 },
  { year: 2024, gridConnection: 68, miniGrids: 45, offGrid: -13 },
]

// Energy consumption patterns by sector
export const energyConsumptionBySector = [
  { sector: "Households", consumption: 45, year: 2023 },
  { sector: "Agriculture", consumption: 28, year: 2023 },
  { sector: "Industry", consumption: 18, year: 2023 },
  { sector: "Commercial", consumption: 9, year: 2023 },
]

// Cooking fuel distribution
export const cookingFuelDistribution = [
  { fuel: "Firewood", percentage: 62, households: "2.8M" },
  { fuel: "Charcoal", percentage: 22, households: "1.0M" },
  { fuel: "LPG", percentage: 10, households: "0.45M" },
  { fuel: "Electricity", percentage: 6, households: "0.27M" },
]
