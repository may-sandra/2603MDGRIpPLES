export default function NavigatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#021933] to-[#0d3b66] border-b-4 border-[#22c55e] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">How to Navigate</h1>
          <p className="text-blue-100 text-sm mt-1">Guide to accessing Kenya's energy data platform</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <section className="mb-8">
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
            The Integrated Energy Planning Data Platform is organized into four main sections accessible from the left navigation menu. Each section provides unique insights into Kenya's energy landscape.
          </p>
        </section>

        {/* Main Sections */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#021933] dark:text-white mb-6">Main Sections</h2>
          <div className="grid gap-6">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-[#021933] dark:text-white mb-2">Overview</h3>
              <p className="text-slate-700 dark:text-slate-300">National energy statistics and trends across Kenya with key performance indicators and year-over-year comparisons.</p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-[#021933] dark:text-white mb-2">Explore</h3>
              <p className="text-slate-700 dark:text-slate-300">Dive deeper into thematic energy data by county or national comparisons. Filter by themes, indicators, and time periods.</p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-[#021933] dark:text-white mb-2">Counties</h3>
              <p className="text-slate-700 dark:text-slate-300">Detailed analysis and comparison of energy metrics for Kilifi, Kiambu, and Nyandarua counties with year-on-year progression data.</p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-[#021933] dark:text-white mb-2">Data Search</h3>
              <p className="text-slate-700 dark:text-slate-300">Search and filter the complete energy dataset by county, theme, indicator, or time period for custom analysis.</p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section>
          <h2 className="text-2xl font-bold text-[#021933] dark:text-white mb-6">Useful Tips</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="text-[#22c55e] font-bold">•</span>
              <span>Click on counties directly on the interactive map to view specific regional data and insights.</span>
            </li>
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="text-[#22c55e] font-bold">•</span>
              <span>Use filter controls to narrow down data by theme, indicator, year, or geographic region.</span>
            </li>
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="text-[#22c55e] font-bold">•</span>
              <span>All charts and graphs update dynamically based on your filter selections for real-time analysis.</span>
            </li>
            <li className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="text-[#22c55e] font-bold">•</span>
              <span>Hover over data points on charts to see detailed values and compare metrics across regions.</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
