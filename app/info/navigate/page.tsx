'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Map, Database, Users } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'
import DashboardHeader from '@/components/dashboard-header'

export default function NavigatePage() {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <DashboardHeader />
      <div className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-1 flex-shrink-0"></div>

      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="border-r border-slate-200 w-48 flex-shrink-0">
            <SidebarContent className="pt-6">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="text-base font-bold text-white hover:opacity-90">
                    <Link href="/" className="flex items-center gap-2">
                      <ArrowLeft size={20} />
                      Back to Home
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <div className="mt-8 border-t border-slate-200 pt-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/navigate' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/navigate" className="w-full">
                        <Map size={18} />
                        Navigate
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/data' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/data" className="w-full">
                        <Database size={18} />
                        Data
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={`text-sm flex items-center gap-2 font-bold ${pathname === '/info/about' ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'}`}>
                      <Link href="/info/about" className="w-full">
                        <Users size={18} />
                        About
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8 max-w-4xl">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Navigate the Platform</h1>

              <div className="space-y-8">
                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Overview Dashboard</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Start here to get a comprehensive view of energy metrics across Kenya. The Overview tab provides national-level insights, key statistics, and trends that help you understand the current state of energy infrastructure and consumption across all counties.
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Explore by Theme</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Deep dive into specific energy themes with interactive visualizations. The Explore section allows you to filter by theme and compare data across counties, with side-by-side comparisons of national averages and county-specific values.
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Counties Comparison</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Compare energy metrics across different Kenyan counties. View year-over-year progression, interact with the map to select counties, and analyze stacked bar charts showing different energy resource categories and connectivity metrics.
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Data Search</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Search across all available data with flexible filtering options. Find specific data points by county, theme, year, and description. Perfect for targeted research and detailed analysis.
                  </p>
                </section>

                <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Pro Tips</h3>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li>• Use the year selector to track changes over time (2019-2033)</li>
                    <li>• Click on counties in the map for quick selection</li>
                    <li>• Compare national vs. county values to identify regional differences</li>
                    <li>• Hover over charts for detailed tooltips with exact values</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
