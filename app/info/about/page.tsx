'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Map, Database, Users } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'
import DashboardHeader from '@/components/dashboard-header'

export default function AboutPage() {
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
              <h1 className="text-2xl font-bold text-slate-900 mb-6">About this Data Platform </h1>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">Project Overview</h2>
                  <p className="text-slate-700 leading-relaxed">
                    This platform is a comprehensive data visualization dashboard designed to provide actionable insights into energy infrastructure, renewable resource potential, and electricity connectivity across 3 Kenyan pilot counties. The platform aggregates data from 2019-2033 to track progress and support evidence-based decision as required by the Integrated National Energy Planning (INEP) circular of 2025.
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Objectives</h2>
                  <p className="text-slate-700 leading-relaxed">
                    To empower policymakers, researchers, and stakeholders with easy access to comprehensive energy data across 3 pilot Kenyan counties, to support CEPs reporting and Energy Modelling.
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700"><strong>Interactive Dashboards:</strong> Real-time data visualization with intuitive controls</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700"><strong>County Comparison:</strong> Side-by-side analysis across 3 pilot Kenyan counties</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700"><strong>Thematic Analysis:</strong> Deep dives into energy resources, connectivity, and consumption</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700"><strong>Advanced Search:</strong> Filtering and data discovery tools</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-slate-700"><strong>Temporal Analysis:</strong> Track trends from 2019 to 2033 (Baseline and targets)</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Partners & Collaborators</h2>
                  <p className="text-slate-700 leading-relaxed">
                    This platform has been developed in collaboration from EED Research Institite (ERI) and University College London (UCL) with Funding from Climate Compatible Growth (CCG).
                  </p>
                </section>

                <section>
                  <h2 className="text-1xl font-semibold text-slate-800 mb-4">Get in Touch</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Have questions or feedback? We'd love to hear from you. For data requests, technical support, or partnership inquiries, please contact the team; <a href="mailto:ambutura@eedadvisory.com" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">ambutura@eedadvisory.com</a> or <a href="mailto:leonhard.hofbauer.18@ucl.ac.uk" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">leonhard.hofbauer.18@ucl.ac.uk</a>.
                  </p>
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-900 font-semibold mb-2">Developed by EED Research Institute (ERI) in collaboration with University College London (UCL)  </p>
                    <p className="text-blue-800 text-sm">Funded by CCG/FCDO</p>
                  </div>
                </section>

                <section className="pt-6 border-t border-slate-200">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">Platform Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">Last Updated</p>
                      <p className="text-slate-600">2026</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Geographic Coverage</p>
                      <p className="text-slate-600">3 pilot counties of Kenya </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Time Period covered </p>
                      <p className="text-slate-600">2019 - 2033</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Data Points</p>
                      <p className="text-slate-600">Multiple Themes</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
