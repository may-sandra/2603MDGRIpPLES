import fs from "fs"
import path from "path"

// Sample Kenya counties topology data - this should be replaced with actual data
const kenyaTopology = {
  type: "Topology",
  objects: {
    counties: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          properties: { "First country": "Kilifi" },
          arcs: [[0, 1, 2, 3]],
        },
        {
          type: "Polygon",
          properties: { "First country": "Kitui" },
          arcs: [[4, 5, 6, 7]],
        },
        {
          type: "Polygon",
          properties: { "First country": "Kiambu" },
          arcs: [[8, 9, 10, 11]],
        },
        {
          type: "Polygon",
          properties: { "First country": "Nyandarua" },
          arcs: [[12, 13, 14, 15]],
        },
      ],
    },
  },
  arcs: [
    // Kilifi arcs
    [[0, 0], [100, 50], [50, 100]],
    [[150, 100], [100, 50], [0, 0]],
    [[150, 100], [200, 150], [250, 100]],
    [[250, 100], [200, 150], [100, 50]],
    // Kitui arcs
    [[250, 100], [300, 150], [350, 100]],
    [[400, 150], [350, 100], [250, 100]],
    [[400, 150], [450, 200], [500, 150]],
    [[500, 150], [450, 200], [350, 100]],
    // Kiambu arcs
    [[100, 50], [150, 0], [200, 50]],
    [[200, 50], [150, 0], [100, 50]],
    [[200, 50], [250, 50], [300, 100]],
    [[300, 100], [250, 50], [150, 0]],
    // Nyandarua arcs
    [[100, 50], [50, 0], [50, 50]],
    [[50, 50], [50, 0], [0, 0]],
    [[50, 50], [100, 100], [150, 100]],
    [[150, 100], [100, 100], [50, 0]],
  ],
  transform: {
    scale: [0.036003600360036, 0.017595307265829],
    translate: [23.358288, -4.678057],
  },
}

const outputPath = path.join(process.cwd(), "public", "kenya-counties.json")
const dir = path.dirname(outputPath)

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

fs.writeFileSync(outputPath, JSON.stringify(kenyaTopology, null, 2))
console.log(`Kenya counties topology data written to ${outputPath}`)
