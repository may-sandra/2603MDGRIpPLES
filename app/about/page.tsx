export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#021933] to-[#0d3b66] border-b-4 border-[#22c55e] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">About This Platform</h1>
          <p className="text-blue-100 text-sm mt-1">Kenya's integrated energy planning data platform</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <section className="mb-8">
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
            The Integrated National Energy Planning Data Platform (INEP) is a comprehensive, evidence-based system supporting Kenya's energy sector planning. It centralizes energy data to enable informed policy-making at both national and county levels under the RIPPLES program.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#021933] dark:text-white mb-6">Key Features</h2>
          <div className="grid gap-4">
            <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4">
              <div className="text-slate-900 dark:text-slate-100 font-bold text-lg pt-0.5">•</div>
              <div>
                <h3 className="font-bold text-[#021933] dark:text-white mb-1">Evidence-Based</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">Data-driven insights and analytics for objective energy planning and policy decisions.</p>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4">
              <div className="text-slate-900 dark:text-slate-100 font-bold text-lg pt-0.5">•</div>
              <div>
                <h3 className="font-bold text-[#021933] dark:text-white mb-1">Collaborative</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">Partnership platform connecting government, research institutions, and development partners.</p>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4">
              <div className="text-slate-900 dark:text-slate-100 font-bold text-lg pt-0.5">•</div>
              <div>
                <h3 className="font-bold text-[#021933] dark:text-white mb-1">County-Focused</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">Localized energy data supporting planning at the county government level across the pilot counties.</p>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-4">
              <div className="text-slate-900 dark:text-slate-100 font-bold text-lg pt-0.5">•</div>
              <div>
                <h3 className="font-bold text-[#021933] dark:text-white mb-1">Standards-Based</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">Follows Kenya's Minimum Data Guidelines (MDG) and the Intergrated National Energy Plan (INEP).</p>
              </div>
            </div>
          </div>
        </section>

        {/* The RIPPLES Program */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#021933] dark:text-white mb-6">The RIPPLES Program</h2>
          
          <div className="mb-6 p-6 bg-gradient-to-br from-[#021933]/5 to-[#22c55e]/5 dark:from-[#021933]/20 dark:to-[#22c55e]/20 rounded-lg border border-[#22c55e]/20 dark:border-[#22c55e]/30">
            <h3 className="font-bold text-[#021933] dark:text-white mb-3">Vision</h3>
            <p className="text-slate-700 dark:text-slate-300">
              A Kenya with robust, integrated energy planning systems leveraging data and evidence for counties reporting.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-[#0d3b66]/5 to-[#22c55e]/5 dark:from-[#0d3b66]/20 dark:to-[#22c55e]/20 rounded-lg border border-[#22c55e]/20 dark:border-[#22c55e]/30">
            <h3 className="font-bold text-[#021933] dark:text-white mb-3">Purpose</h3>
            <p className="text-slate-700 dark:text-slate-300">
              Strengthen energy planning capabilities and improve decision-making at national and county levels through reliable, standardized energy data, advanced analytics, and evidence-based frameworks for 3 pilot counties out of counties.
            </p>
          </div>
        </section>

        {/* Partners */}
        <section>
          <h2 className="text-2xl font-bold text-[#021933] dark:text-white mb-6">Partners & Institutions</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            This platform is developed in collaboration with:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
              <span>EED Advisory Research Institute (ERI)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
              <span>University College London</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
              <span>Climate Compartible Growth (CCG)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
              <span>INEP and the pilot counties</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
              <span>County governments across Kenya</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
