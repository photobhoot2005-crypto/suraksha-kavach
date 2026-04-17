export default function StatsBar({ stats }) {
  const cards = [
    { label: 'Total Incidents', value: stats.total_incidents, color: '#00f0ff', icon: '📊' },
    { label: 'Critical', value: stats.by_severity?.CRITICAL || 0, color: '#ff3366', icon: '🔴' },
    { label: 'High', value: stats.by_severity?.HIGH || 0, color: '#ff9900', icon: '🟠' },
    { label: 'Correlated', value: stats.correlated_incidents || 0, color: '#b026ff', icon: '⚡' },
    { label: 'False Positives', value: stats.false_positives || 0, color: '#00ff66', icon: '✅' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
      {cards.map(card => (
        <div
          key={card.label}
          className="card"
          style={{
            position: 'relative',
            textAlign: 'left',
            padding: '20px',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '124px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: card.color,
              opacity: '0.12',
              filter: 'blur(40px)'
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', fontSize: '24px' }}>
              <div>{card.icon}</div>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  background: card.color,
                  boxShadow: `0 0 14px ${card.color}`
                }}
              />
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: card.color,
                marginBottom: '5px',
                lineHeight: 1
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#94a3b8',
                fontWeight: 600
              }}
            >
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}