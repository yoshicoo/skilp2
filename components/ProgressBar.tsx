'use client'
export default function ProgressBar({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
      <div className="h-full bg-primary transition-all" style={{ width: `${v}%` }} />
    </div>
  )
}
