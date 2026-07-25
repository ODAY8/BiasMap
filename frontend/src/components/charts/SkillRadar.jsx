import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function SkillRadar({ data }) {
  const chartData = data.map((s) => ({ skill: s.skill.split(' ')[0], value: s.level }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 10 }} />
        <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
        <Tooltip
          contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f1f5f9' }}
          formatter={(v) => [`${v}%`]}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
