'use client'
import type { ProjectItem } from '@/types'

export default function Timeline({ projects }: { projects: ProjectItem[] }) {
  if (!projects?.length) return null
  return (
    <ol className="relative border-slate-700/60">
      {projects.map((p, idx) => (
        <li key={idx} className="mb-8 ms-4">
          <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -start-1.5 border border-slate-800"></div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">{p.title || 'プロジェクト'}</h4>
              <span className="text-sm text-slate-400">{p.period || '-'}</span>
            </div>
            <p className="text-slate-300 text-sm mt-1">{p.industry ? `業界: ${p.industry}` : ''} {p.size ? ` / 規模: ${p.size}` : ''} {p.role ? ` / 役割: ${p.role}` : ''}</p>
            {p.description && <p className="mt-2 text-slate-200">{p.description}</p>}
            {p.techStack && p.techStack.length > 0 && (
              <p className="text-slate-300 text-sm mt-2">使用技術: {p.techStack.join(', ')}</p>
            )}
            {p.achievements && p.achievements.length > 0 && (
              <ul className="mt-2 text-slate-200 list-disc list-inside">
                {p.achievements.map((a,i)=>(<li key={i}>{a}</li>))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
