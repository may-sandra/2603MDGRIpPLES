export const ACTIVE_COUNTIES = ["Kilifi", "Kiambu", "Nyandarua"]
export const ACTIVE_COUNTY_COLOR = "#003570" // Dark navy blue
export const INACTIVE_COLOR = "#D1D5DB" // Grey
export const SELECTED_COLOR_GREEN = "#22c55e" // Green accent

// SVG path index to county name mapping - corrected based on SVG structure
export const SVG_PATH_TO_COUNTY: Record<number, string> = {
  0: "Mombasa", // OBJECTID 1
  1: "Kwale", // OBJECTID 2
  2: "Kilifi", // OBJECTID 3
  3: "Tana River", // OBJECTID 4
  4: "Lamu", // OBJECTID 5
  5: "Taita Taveta", // OBJECTID 6
  6: "Garissa", // OBJECTID 7
  7: "Wajir", // OBJECTID 8
  8: "Mandera", // OBJECTID 9
  9: "Marsabit", // OBJECTID 10
  10: "Isiolo", // OBJECTID 11
  11: "Meru", // OBJECTID 12
  12: "Tharaka-Nithi", // OBJECTID 13
  13: "Embu", // OBJECTID 14
  14: "Kitui", // OBJECTID 15
  15: "Machakos", // OBJECTID 16
  16: "Makueni", // OBJECTID 17
  17: "Nyandarua", // OBJECTID 18
  18: "Nyeri", // OBJECTID 19
  19: "Kirinyaga", // OBJECTID 20
  20: "Murang'a", // OBJECTID 21
  21: "Kiambu", // OBJECTID 22
  22: "Turkana", // OBJECTID 23
  23: "West Pokot", // OBJECTID 24
  24: "Samburu", // OBJECTID 25
  25: "Trans Nzoia", // OBJECTID 26
  26: "Uasin Gishu", // OBJECTID 27
  27: "Elgeyo-Marakwet", // OBJECTID 28
  28: "Nandi", // OBJECTID 29
  29: "Baringo", // OBJECTID 30
  30: "Laikipia", // OBJECTID 31
  31: "Nakuru", // OBJECTID 32
  32: "Narok", // OBJECTID 33
  33: "Kajiado", // OBJECTID 34
  34: "Kericho", // OBJECTID 35
  35: "Bomet", // OBJECTID 36
  36: "Kakamega", // OBJECTID 37
  37: "Vihiga", // OBJECTID 38
  38: "Bungoma", // OBJECTID 39
  39: "Busia", // OBJECTID 40
  40: "Siaya", // OBJECTID 41
  41: "Kisumu", // OBJECTID 42
  42: "Homa Bay", // OBJECTID 43
  43: "Migori", // OBJECTID 44
  44: "Kisii", // OBJECTID 45
  45: "Nyamira", // OBJECTID 46
  46: "Nairobi", // OBJECTID 47
}

export function getCountyColor(county: string, isSelected: boolean, isActive: boolean): string {
  if (isSelected) return SELECTED_COLOR_GREEN
  if (isActive) return ACTIVE_COUNTY_COLOR
  return INACTIVE_COLOR
}
