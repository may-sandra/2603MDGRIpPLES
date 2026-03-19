const THEMATIC_COLORS: Record<string, string> = {
  "Resource Potential": "chart-1",
  "Electricity Access": "chart-2",
  "Electricity Demand": "chart-3",
  Cooking: "chart-4",
  Petroleum: "chart-5",
  Projects: "primary",
  Finance: "secondary",
  "Grid Reliability": "accent",
  Emissions: "destructive",
}

const THEMATIC_DESCRIPTIONS: Record<string, string> = {
  "Resource Potential": "Solar, wind, and biomass resource assessment",
  "Electricity Access": "Household electrification and connection targets",
  "Electricity Demand": "Consumption patterns and growth targets",
  Cooking: "Clean cooking fuel adoption and LPG transition",
  Petroleum: "Kerosene phase-out and petroleum reduction",
  Projects: "Renewable energy generation and mini-grid pipelines",
  Finance: "County energy sector budgeting and investments",
  "Grid Reliability": "SAIDI/SAIFI metrics and grid performance",
  Emissions: "Energy-related greenhouse gas emissions",
}

export function getThematicColor(thematicArea: string): string {
  return THEMATIC_COLORS[thematicArea] || "primary"
}

export function getThematicDescription(thematicArea: string): string {
  return THEMATIC_DESCRIPTIONS[thematicArea] || ""
}

export function getThematicIcon(thematicArea: string): string {
  const icons: Record<string, string> = {
    "Resource Potential": "⚡",
    "Electricity Access": "🔌",
    "Electricity Demand": "📊",
    Cooking: "🍳",
    Petroleum: "🛢️",
    Projects: "🏗️",
    Finance: "💰",
    "Grid Reliability": "📡",
    Emissions: "🌍",
  }
  return icons[thematicArea] || "📋"
}
