const MITRE_INFO = {
  BRUTE_FORCE: { id: 'T1110', tactic: 'Credential Access', color: '#ff3366', desc: 'Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.' },
  C2_BEACON: { id: 'T1071', tactic: 'Command & Control', color: '#b026ff', desc: 'Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic.' },
  LATERAL_MOVEMENT: { id: 'T1021', tactic: 'Lateral Movement', color: '#ff8a4c', desc: 'Adversaries may use valid accounts to log into a service specifically designed to accept remote connections.' },
  DATA_EXFILTRATION: { id: 'T1041', tactic: 'Exfiltration', color: '#ff9900', desc: 'Adversaries may steal data by exfiltrating it over an existing command and control channel.' }
}

export default function MitrePanel({ incidents }) {
  const detected = [...new Set(incidents.map(i => i.rule))].filter(r => MITRE_INFO[r])

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: '12px', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        🗺️ MITRE ATT&CK Coverage
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {Object.entries(MITRE_INFO).map(([rule, info]) => {
          const isDetected = detected.includes(rule)
          const count = incidents.filter(i => i.rule === rule).length
          return (
            <div
              key={rule}
              className="card"
              style={{
                borderColor: isDetected ? `${info.color}55` : 'rgba(255,255,255,0.05)',
                opacity: isDetected ? 1 : 0.55,
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40`, padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {info.id}
                </span>
                {isDetected && (
                  <span style={{ background: 'rgba(0,255,102,0.1)', color: '#00ff66', border: '1px solid rgba(0,255,102,0.3)', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                    ✅ {count} detected
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: info.color, marginBottom: '4px' }}>
                {rule.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>{info.tactic}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>{info.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}