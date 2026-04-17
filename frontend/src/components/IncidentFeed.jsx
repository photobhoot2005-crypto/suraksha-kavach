const RULE_LABELS = {
  BRUTE_FORCE: '🔐 Brute Force',
  C2_BEACON: '📡 C2 Beacon',
  LATERAL_MOVEMENT: '↔️ Lateral Move',
  DATA_EXFILTRATION: '📤 Data Exfil',
  ML_ANOMALY: '🤖 ML Anomaly'
}

export default function IncidentFeed({ incidents, selectedId, onSelect }) {
  if (incidents.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '72px 24px',
          color: '#64748b',
          background: 'linear-gradient(180deg, rgba(5,10,18,0.96), rgba(9,16,26,0.96))'
        }}
      >
        <div style={{ fontSize: '52px', marginBottom: '18px' }}>🛡️</div>
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px', color: '#ffffff' }}>
          No Incidents Detected
        </div>
        <div style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto', lineHeight: '1.7', color: '#94a3b8' }}>
          Use the Attack Simulator above to inject scenarios and see live detections
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontWeight: 800, fontSize: '12px', color: '#94a3b8', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          🚨 Live Incident Feed
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            padding: '6px 10px',
            borderRadius: '999px',
            background: 'rgba(0,240,255,0.06)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {incidents.length} incidents
        </div>
      </div>

      <div style={{ maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
        {incidents.map(inc => (
          <div
            key={inc.id}
            className={`incident-row slide-in ${selectedId === inc.id ? 'selected' : ''}`}
            onClick={() => onSelect(inc)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  className={`badge-${inc.severity}`}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  {inc.severity}
                </span>

                <span style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0' }}>
                  {RULE_LABELS[inc.rule] || inc.rule}
                </span>

                {inc.correlated && (
                  <span
                    style={{
                      background: 'rgba(176,38,255,0.1)',
                      color: '#b026ff',
                      border: '1px solid rgba(176,38,255,0.3)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    ⚡ CORRELATED
                  </span>
                )}

                {inc.is_false_positive && (
                  <span
                    style={{
                      background: 'rgba(0,255,102,0.1)',
                      color: '#00ff66',
                      border: '1px solid rgba(0,255,102,0.3)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    ✅ FALSE POS
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {Math.round(inc.confidence * 100)}% conf
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {new Date(inc.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '10px',
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'JetBrains Mono, monospace',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ padding: '4px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                SRC: {inc.src_ip}
              </span>
              <span style={{ padding: '4px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                DST: {inc.dst_ip}
              </span>
              <span style={{ padding: '4px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                :{inc.port}
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0,240,255,0.07)',
                  border: '1px solid rgba(0,240,255,0.12)',
                  textTransform: 'uppercase',
                  color: '#3b82f6'
                }}
              >
                {inc.layer}
              </span>
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.65' }}>
              {inc.explanation?.substring(0, 120)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}