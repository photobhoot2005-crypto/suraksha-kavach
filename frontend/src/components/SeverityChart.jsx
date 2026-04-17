import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts'

const SEVERITY_COLORS = {
  CRITICAL: '#ff3366',
  HIGH: '#ff9900',
  MEDIUM: '#b026ff',
  LOW: '#3b82f6'
}

export default function SeverityChart({ incidents, stats }) {
  const severityData = Object.entries(stats?.by_severity || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const timelineData = (incidents || []).slice(-30).map((inc, i) => ({
    name: i + 1,
    confidence: Math.round((inc.confidence || 0) * 100),
  }))

  const gradientId = 'barGradient'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}
    >
      {/* LEFT: Confidence Score Timeline */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, rgba(5,10,18,0.96), rgba(9,16,26,0.96))',
          borderRadius: '16px',
          padding: '20px',
          minHeight: '280px'
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: '11px',
            color: '#94a3b8',
            marginBottom: '16px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📈 Confidence Score Timeline (Last 24h)
        </div>

        {timelineData.length > 0 ? (
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} barCategoryGap="30%">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.9)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.1)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#09101a',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }}
                  formatter={(val) => [`${val}%`, 'AI Confidence Score']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey="confidence"
                  fill={`url(#${gradientId})`}
                  stroke="rgba(59,130,246,1)"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', fontSize: '13px' }}>
            Run a simulation to see confidence timeline
          </div>
        )}
      </div>

      {/* RIGHT: Incident Severity Distribution */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, rgba(5,10,18,0.96), rgba(9,16,26,0.96))',
          borderRadius: '16px',
          padding: '20px',
          minHeight: '280px'
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: '11px',
            color: '#94a3b8',
            marginBottom: '16px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🎯 Incident Severity Distribution
        </div>

        {severityData.length > 0 ? (
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="42%"
                  cy="50%"
                  outerRadius={88}
                  innerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#09101a',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', fontSize: '13px' }}>
            No data yet — run a simulation
          </div>
        )}
      </div>
    </div>
  )
}