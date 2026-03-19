'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  categories: string[]
}

const categoryDescriptions: Record<string, string> = {
  'Socio-Economic & Institutional': 'Population, demographics, and institutional data',
  'Energy Resource Potential': 'Renewable energy resources and potential',
  'Infrastructure & Access': 'Grid connectivity and access to energy services',
  'Energy Demand & Consumption': 'Electricity usage and fuel consumption patterns',
}

const categoryIcons: Record<string, string> = {
  'Socio-Economic & Institutional': '👥',
  'Energy Resource Potential': '⚡',
  'Infrastructure & Access': '🏗️',
  'Energy Demand & Consumption': '📊',
}

export default function CategoryFilter({ selectedCategory, onCategorySelect, categories }: CategoryFilterProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data by Category</CardTitle>
        <CardDescription>Filter energy data by category type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => onCategorySelect(selectedCategory === category ? null : category)}
              >
                <span className="mr-2">{categoryIcons[category] || '📁'}</span>
                <div className="flex-1">
                  <div className="font-medium">{category}</div>
                  <div className="text-xs opacity-75">{categoryDescriptions[category] || 'Category data'}</div>
                </div>
              </Button>
            ))
          ) : (
            <p className="text-sm text-slate-500">No categories available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
