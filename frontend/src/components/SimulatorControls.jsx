const SCENARIOS = [
  { id: 'brute_force', label: '🔐 Brute Force', color: '#ff4757' },
  { id: 'c2', label: '📡 C2 Beacon', color: '#7c3aed' },
  { id: 'lateral', label: '↔️ Lateral Movement', color: '#ff6b35' },
  { id: 'exfil', label: '📤 Data Exfil', color: '#ffa502' },
  { id: 'false_positive', label: '✅ False Positive', color: '#2ed573' },
  { id: 'full_attack', label: '💀 Full Attack', color: '#ff4757' },
]

export default function SimulatorControls({ onSimulate, onClear, simulating }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#8aa3c7' }}>⚡ ATTACK SIMULATOR</div>
          <div style={{ fontSize: '12px', color: '#4a6fa5', marginTop: '2px' }}>Inject attack scenarios into the live detection pipeline</div>
        </div>
        <button className="btn-danger" onClick={onClear} style={{ fontSize: '12px', padding: '7px 14px' }}>🗑️ Clear All</button>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => onSimulate(s.id)} disabled={simulating}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${s.color}40`,
              background: `${s.color}15`, color: s.color, cursor: simulating ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '13px', transition: 'all 0.2s', opacity: simulating ? 0.5 : 1 }}>
            {simulating ? '⏳ Running...' : s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
