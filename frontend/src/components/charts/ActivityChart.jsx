import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#94a3b8' }}
        />
        <Bar dataKey="analyses" name="Analyses" fill="#6366f1" radius={[3, 3, 0, 0]} />
        <Bar dataKey="lessons" name="Lessons" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
