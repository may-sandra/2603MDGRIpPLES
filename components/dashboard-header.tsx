export default function DashboardHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-b-4 border-[#10b981] flex-shrink-0">
      <div className="w-full px-8 py-6 bg-primary">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-white text-4xl">
            Integrated Energy Planning Data Platform
          </h1>
          <p className="text-slate-200 text-sm font-medium">
            Integrated planning platform for energy data across Kenyan counties
          </p>
        </div>
      </div>
    </header>
  )
}
