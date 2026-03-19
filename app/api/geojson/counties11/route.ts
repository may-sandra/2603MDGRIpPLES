import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "kenya-counties-11.json")
    const data = await readFile(filePath, "utf-8")
    return new Response(data, {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error reading GeoJSON:", error)
    return new Response(JSON.stringify({ error: "Failed to load GeoJSON" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
