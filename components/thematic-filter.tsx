"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUniqueThematicAreas } from "@/lib/data"
import { getThematicDescription, getThematicIcon } from "@/lib/thematic-utils"

interface ThematicFilterProps {
  selectedThematic: string | null
  onThematicSelect: (area: string | null) => void
}

export default function ThematicFilter({ selectedThematic, onThematicSelect }: ThematicFilterProps) {
  const thematicAreas = getUniqueThematicAreas()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data by Theme</CardTitle>
        <CardDescription>Filter energy data by thematic area</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {thematicAreas.map((area) => (
            <Button
              key={area}
              variant={selectedThematic === area ? "default" : "outline"}
              className="w-full justify-start text-left"
              onClick={() => onThematicSelect(selectedThematic === area ? null : area)}
            >
              <span className="mr-2">{getThematicIcon(area)}</span>
              <div className="flex-1">
                <div className="font-medium">{area}</div>
                <div className="text-xs opacity-75">{getThematicDescription(area)}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
