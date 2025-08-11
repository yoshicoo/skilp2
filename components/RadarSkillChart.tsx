'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import type { SkillItem } from '@/types'

export default function RadarSkillChart({ skills }: { skills: SkillItem[] }) {
  const top = [...skills].sort((a,b)=>b.level-a.level).slice(0,6)
  const data = top.map(s => ({ subject: s.name, A: s.level }))
  if (data.length === 0) return null
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0,5]} />
          <Radar name="Skill" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.45} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
