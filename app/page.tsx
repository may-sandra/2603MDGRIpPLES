"use client"

import Link from "next/link"

import { useState } from "react"
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/dashboard-header"
import DashboardOverview from "@/components/dashboard-overview"
import ExploreDashboard from "@/components/explore-dashboard"
import { ThemesChartsContent } from "@/components/themed-charts-content"
import DataDetails from "@/components/data-details"
import { energyData } from "@/lib/data"
import { BarChart3, Map, Compass, Database } from "lucide-react"

const infoPages = [
  { href: "/info/navigate", label: "Navigate" },
  { href: "/info/data", label: "Data" },
  { href: "/info/about", label: "About" },
]

const mapLink = { href: "/map", label: "Interactive Map" }

export default function Page() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("overview")
  const [activeInfoTab, setActiveInfoTab] = useState("navigate")

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "themed-charts", label: "Counties", icon: Map },
  ]

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      {/* Header - Full Width */}
      <DashboardHeader />

      {/* Navigation Bar - Full Width Green Accent */}
      <div className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-1 flex-shrink-0"></div>

      {/* Main Content Area with Sidebar - Takes remaining space */}
      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Sticky to header */}
          <Sidebar className="border-r border-slate-200 dark:border-slate-800 w-48 flex-shrink-0 overflow-y-auto">
            <SidebarContent className="pt-6">
              {/* Main Navigation */}
              <SidebarMenu>
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(section.id)}
                        isActive={activeSection === section.id}
                        className={`text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? "bg-[#003570] text-white"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-background" />
                        <span className="text-background">{section.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>

              {/* Separator */}
              <div className="my-6 border-t border-slate-200 dark:border-slate-800"></div>

              {/* Info Pages */}
              <div className="px-3">
                <p className="text-xs dark:text-slate-400 mb-3 uppercase tracking-wide dark:text-slate-400 font-bold text-background">Info</p>
                <SidebarMenu>
                  {infoPages.map((page) => (
                    <SidebarMenuItem key={page.href}>
                      <Link href={page.href} className="w-full">
                        <SidebarMenuButton
                          className="text-sm transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                          <span className="text-white">{page.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="w-full px-3 py-8">
              {activeSection === "overview" && <DashboardOverview />}
              {activeSection === "explore" && <ExploreDashboard />}
              {activeSection === "themed-charts" && <ThemesChartsContent />}
            </div>
          </main>
        </div>
      </SidebarProvider>

      {/* Footer - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#003570] dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700 py-3 w-full z-40 bg-[rgba(15,35,58,1)]">
        <div className="flex justify-center items-center px-4">
          <p className="text-sm text-slate-100 dark:text-slate-300 font-medium text-center">
            Developed by{" "}
            <a
              href="https://eedadvisory.com/en/research-institute"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 underline transition-colors"
            >
              EED Research Institute (ERI)
            </a>
            {" "}in collaboration with{" "}
            <a
              href="https://www.ucl.ac.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 underline transition-colors"
            >
              UCL
            </a>
            {" "}and funded by{" "}
            <a
              href="https://climatecompatiblegrowth.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 underline transition-colors"
            >
              CCG
            </a>
            /FCDO
          </p>
        </div>
      </div>
    </div>
  )
}
