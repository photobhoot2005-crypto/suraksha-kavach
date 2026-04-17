import { useState, useEffect } from 'react'
import axios from 'axios'

const BACKEND_URL = 'http://localhost:8000'

const SCENARIOS = [
  {
    id: 'brute_force',
    label: 'Brute Force Attack',
    icon: '🔐',
    color: '#ff4757',
    desc: 'Simulate repeated failed login attempts from a single source IP targeting SSH/RDP services.',
    mitre: 'T1110 — Credential Access',
  },
  {
    id: 'c2',
    label: 'C2 Beaconing',
    icon: '📡',
    color: '#7c3aed',
    desc: 'Simulate periodic low-volume outbound connections to an external C2 server with high timing regularity.',
    mitre: 'T1071 — Command & Control',
  },
  {
    id: 'lateral',
    label: 'Lateral Movement',
    icon: '↔️',
    color: '#ff6b35',
    desc: 'Simulate a compromised host connecting to multiple internal endpoints via SMB/WMI/PsExec.',
    mitre: 'T1021 — Lateral Movement',
  },
  {
    id: 'exfil',
    label: 'Data Exfiltration',
    icon: '📤',
    color: '#ffa502',
    desc: 'Simulate large volume outbound data transfer to an external destination exceeding baseline.',
    mitre: 'T1041 — Exfiltration',
  },
  {
    id: 'false_positive',
    label: 'False Positive',
    icon: '✅',
    color: '#2ed573',
    desc: 'Simulate a legitimate admin backup transfer that resembles exfiltration — tests false positive handling.',
    mitre: 'T1041 — Exfiltration (benign)',
  },
  {
    id: 'full_attack',
    label: 'Full APT Campaign',
    icon: '💀',
    color: '#ff4757',
    desc: 'Simulate a full multi-stage attack: brute force → lateral movement → C2 → data exfiltration simultaneously.',
    mitre: 'Multi-technique — Cross-layer correlated',
  },
]

export default function AttackSimulator() {
  const [log, setLog] = useState([])
  const [launching, setLaunching] = useState(null)
  const [stopping, setStopping] = useState(null)
  // Set of currently running scenario IDs
  const [running, setRunning] = useState(new Set())

  // Poll backend every 3s to sync running state
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/simulate/status`)
        setRunning(new Set(res.data.active))
      } catch (e) {}
    }, 3000)
    return () => clearInterval(poll)
  }, [])

  const launch = async (scenario) => {
    setLaunching(scenario.id)
    const ts = new Date().toLocaleTimeString()
    try {
      const res = await axios.post(`${BACKEND_URL}/simulate`, { scenario: scenario.id })
      setRunning(prev => new Set([...prev, scenario.id]))
      setLog(prev => [{
        ts,
        scenario: scenario.label,
        icon: scenario.icon,
        color: scenario.color,
        status: 'launched',
        message: res.data.message,
      }, ...prev].slice(0, 20))
    } catch (e) {
      setLog(prev => [{
        ts,
        scenario: scenario.label,
        icon: scenario.icon,
        color: '#ff4757',
        status: 'error',
        message: 'Backend not reachable',
      }, ...prev].slice(0, 20))
    }
    setLaunching(null)
  }

  const stop = async (scenario) => {
    setStopping(scenario.id)
    const ts = new Date().toLocaleTimeString()
    try {
      await axios.post(`${BACKEND_URL}/simulate/stop`, { scenario: scenario.id })
      setRunning(prev => {
        const next = new Set(prev)
        next.delete(scenario.id)
        return next
      })
      setLog(prev => [{
        ts,
        scenario: scenario.label,
        icon: '🛑',
        color: '#ff4757',
        status: 'stopped',
        message: 'Attack stopped. Incidents remain in SOC dashboard.',
      }, ...prev].slice(0, 20))
    } catch (e) {
      setLog(prev => [{
        ts,
        scenario: scenario.label,
        icon: '⚠️',
        color: '#ffa502',
        status: 'error',
        message: 'Failed to stop simulation',
      }, ...prev].slice(0, 20))
    }
    setStopping(null)
  }

  const clearAll = async () => {
    await axios.delete(`${BACKEND_URL}/incidents/clear`)
    setLog([])
    setRunning(new Set())
  }

  const isRunning = (id) => running.has(id)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', padding: '24px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#ff4757' }}>⚔️ Red Team Attack Console</div>
          <div style={{ fontSize: '12px', color: '#4a6fa5', marginTop: '4px' }}>Launch attack scenarios — watch them trigger live on the SOC Dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ background: '#0066cc', color: 'white', padding: '8px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            🖥️ Open SOC Dashboard →
          </a>
          <button onClick={clearAll}
            style={{ background: 'rgba(255,71,87,0.15)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            🗑️ Clear All Incidents
          </button>
        </div>
      </div>

      {/* Attack Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {SCENARIOS.map(s => (
          <div
            key={s.id}
            style={{
              background: '#0d1526',
              border: `1px solid ${isRunning(s.id) ? s.color + '80' : s.color + '30'}`,
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.2s',
              boxShadow: isRunning(s.id) ? `0 0 18px ${s.color}25` : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '32px' }}>{s.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isRunning(s.id) && (
                  <span style={{
                    background: 'rgba(0,255,102,0.1)',
                    color: '#00ff66',
                    border: '1px solid rgba(0,255,102,0.3)',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#00ff66',
                      boxShadow: '0 0 6px #00ff66',
                      display: 'inline-block'
                    }} />
                    LIVE
                  </span>
                )}
                <span style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40`, padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>
                  {s.mitre}
                </span>
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: '16px', color: '#c8d8f0', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '12px', color: '#4a6fa5', lineHeight: '1.6', marginBottom: '16px', minHeight: '48px' }}>{s.desc}</div>

            {/* Buttons row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Launch Button */}
              <button
                onClick={() => launch(s)}
                disabled={launching === s.id || isRunning(s.id)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: isRunning(s.id) ? '#1e2d45' : launching === s.id ? '#1e2d45' : `${s.color}20`,
                  color: isRunning(s.id) ? '#4a6fa5' : launching === s.id ? '#4a6fa5' : s.color,
                  border: `1px solid ${s.color}40`,
                  borderRadius: '8px',
                  cursor: isRunning(s.id) || launching === s.id ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                {launching === s.id ? '⏳ Launching...' : isRunning(s.id) ? '🟢 Running...' : `🚀 Launch`}
              </button>

              {/* Stop Button — only shows when running */}
              {isRunning(s.id) && (
                <button
                  onClick={() => stop(s)}
                  disabled={stopping === s.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,71,87,0.15)',
                    color: '#ff4757',
                    border: '1px solid rgba(255,71,87,0.4)',
                    borderRadius: '8px',
                    cursor: stopping === s.id ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {stopping === s.id ? '⏳' : '⏹ Stop'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Launch Log */}
      <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#8aa3c7', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>📋 ATTACK LAUNCH LOG</span>
          <span style={{ color: '#4a6fa5', fontWeight: 400 }}>{log.length} entries</span>
        </div>
        {log.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#4a6fa5', fontSize: '13px' }}>
            No attacks launched yet — click a scenario above to begin
          </div>
        ) : (
          <div>
            {log.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '10px 14px', background: '#111d35', borderRadius: '8px',
                marginBottom: '8px', border: `1px solid ${entry.color}25`
              }}>
                <span style={{ fontSize: '20px' }}>{entry.icon}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4a6fa5', minWidth: '70px' }}>{entry.ts}</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: entry.color, flex: 1 }}>{entry.scenario}</span>
                {entry.status === 'launched' && (
                  <span style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                    🚀 {entry.message}
                  </span>
                )}
                {entry.status === 'stopped' && (
                  <span style={{ background: 'rgba(255,71,87,0.1)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                    ⏹ {entry.message}
                  </span>
                )}
                {entry.status === 'error' && (
                  <span style={{ background: 'rgba(255,71,87,0.1)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                    ❌ {entry.message}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}