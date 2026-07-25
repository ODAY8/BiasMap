import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const EMOTION_COLORS = {
  hope: '#10b981',
  fear: '#ef4444',
  anger: '#f59e0b',
  urgency: '#8b5cf6',
  neutral: '#64748b',
}

export default function EmotionChart({ data }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    emotion: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: EMOTION_COLORS[key],
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis
          dataKey="emotion"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#94a3b8' }}
          formatter={(v) => [`${v}%`, 'Intensity']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
