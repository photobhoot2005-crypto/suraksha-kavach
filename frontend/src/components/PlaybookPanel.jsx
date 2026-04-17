export default function PlaybookPanel({ incident, playbook, loading, onGenerate }) {
  if (!incident) return null
  const severityColors = { CRITICAL: '#ff3366', HIGH: '#ff9900', MEDIUM: '#b026ff', LOW: '#00ff66' }
  const color = severityColors[incident.severity] || '#3b82f6'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="card" style={{ borderColor: `${color}40` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color, fontWeight: 700, fontSize: '15px' }}>{incident.rule?.replace(/_/g, ' ')}</span>
          <span className={`badge-${incident.severity}`} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {incident.severity}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          {[
            ['Source IP', incident.src_ip],
            ['Destination', incident.dst_ip],
            ['Port', incident.port],
            ['Layer', incident.layer?.toUpperCase()],
            ['User', incident.user],
            ['Process', incident.process],
            ['Confidence', `${Math.round(incident.confidence * 100)}%`],
            ['MITRE', `${incident.mitre_technique} — ${incident.mitre_tactic}`],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', marginTop: '2px', wordBreak: 'break-all' }}>{value}</div>
            </div>
          ))}
        </div>

        {incident.correlated && (
          <div style={{ marginTop: '10px', background: 'rgba(176,38,255,0.1)', border: '1px solid rgba(176,38,255,0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#b026ff' }}>
            ⚡ Cross-layer correlation: evidence across {incident.layers_involved?.join(' + ')} layers
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          🔍 Detection Reasoning
        </div>
        <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7' }}>{incident.explanation}</div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            📋 Response Playbook
          </div>
          <button
            className="btn-primary"
            onClick={onGenerate}
            disabled={loading}
            style={{
              fontSize: '12px',
              padding: '8px 14px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '⏳ Generating...' : playbook.length ? '🔄 Regenerate' : '⚡ Generate AI Playbook'}
          </button>
        </div>

        {playbook.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playbook.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '10px 12px',
                  background: '#09101a',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <span
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6' }}>{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
            Click "Generate AI Playbook" to create a dynamic incident response plan
          </div>
        )}
      </div>
    </div>
  )
}