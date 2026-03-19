export const countyThematicMap: Record<string, string> = {
  Kilifi: "coastal",
  Kitui: "eastern",
  Kiambu: "central",
  Nyandarua: "central-highlands",
  // Add more counties as needed
}

export const thematicZones = {
  coastal: { color: "#00B4D8", label: "Coastal", counties: ["Kilifi", "Mombasa", "Kwale", "Lamu"] },
  eastern: { color: "#FFD60A", label: "Eastern", counties: ["Kitui", "Makueni", "Taita-Taveta", "Tharaka-Nithi"] },
  central: { color: "#06D6A0", label: "Central", counties: ["Kiambu", "Nairobi", "Kajiado"] },
  "central-highlands": { color: "#118B22", label: "Central Highlands", counties: ["Nyandarua", "Muranga", "Nyeri"] },
}
