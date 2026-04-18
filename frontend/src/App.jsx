import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import StatsBar from './components/StatsBar'
import IncidentFeed from './components/IncidentFeed'
import MitrePanel from './components/MitrePanel'
import PlaybookPanel from './components/PlaybookPanel'
import SeverityChart from './components/SeverityChart'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const WS_URL = BACKEND_URL.replace('http', 'ws') + '/ws'

// ─── Login Page ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (username === 'analyst' && password === 'suraksha123') {
        // Request notification permission on first login
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission()
        }
        onLogin()
      } else {
        setError('Invalid credentials. Access denied.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(0,240,255,0.08), transparent 20%), radial-gradient(circle at top left, rgba(59,130,246,0.06), transparent 18%), linear-gradient(180deg, #020408 0%, #050a12 45%, #020408 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(5,10,18,0.96), rgba(9,16,26,0.98))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 0 60px rgba(59,130,246,0.08)',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <div style={{ fontWeight: 800, fontSize: '26px', color: '#ffffff', letterSpacing: '-0.03em' }}>
            Suraksha Kavach
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3b82f6', marginTop: '6px' }}>
            SOC Analyst Portal
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            🔒 Authorized Personnel Only
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Enter username"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Enter password"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,51,102,0.1)',
              border: '1px solid rgba(255,51,102,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#ff3366',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '🔐 Authenticating...' : '🔓 Access Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#334155' }}>
          Hack Malenadu '26 · Cybersecurity Track
        </div>
      </div>
    </div>
  )
}

// ─── Toast Notification ───────────────────────────────────────
function Toast({ incident, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  const severityColor = {
    critical: '#ff3366',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  }[incident?.severity?.toLowerCase()] || '#3b82f6'

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      background: 'linear-gradient(180deg, rgba(5,10,18,0.98), rgba(9,16,26,0.99))',
      border: `1px solid ${severityColor}44`,
      borderLeft: `4px solid ${severityColor}`,
      borderRadius: '12px',
      padding: '16px 20px',
      minWidth: '320px',
      maxWidth: '400px',
      boxShadow: `0 0 30px ${severityColor}22, 0 8px 32px rgba(0,0,0,0.5)`,
      backdropFilter: 'blur(12px)',
      animation: 'slideIn 0.3s ease',
      color: '#ffffff'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: severityColor, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: severityColor, display: 'inline-block', boxShadow: `0 0 8px ${severityColor}` }} />
            🚨 {incident?.severity?.toUpperCase()} ALERT DETECTED
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>
            {incident?.rule_name || incident?.threat_type || 'Threat Detected'}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
            {incident?.src_ip && `From: ${incident.src_ip}`}
            {incident?.mitre_id && ` · ${incident.mitre_id}`}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', marginLeft: '12px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [toast, setToast] = useState(null)

  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState({ total_incidents: 0, by_severity: {}, by_rule: {}, false_positives: 0, correlated_incidents: 0 })
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [playbook, setPlaybook] = useState([])
  const [loadingPlaybook, setLoadingPlaybook] = useState(false)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('incidents')
  const wsRef = useRef(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/stats`)
      setStats(res.data)
    } catch (e) {}
  }, [])

  // ─── Browser + In-app notification on new incident ───────────
  const triggerAlert = useCallback((incident) => {
    // In-app toast
    setToast(incident)

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const severityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[incident?.severity?.toLowerCase()] || '🔵'
      new Notification(`${severityEmoji} ${incident?.severity?.toUpperCase()} Alert — Suraksha Kavach`, {
        body: `${incident?.rule_name || incident?.threat_type || 'Threat detected'}\n${incident?.src_ip ? 'From: ' + incident.src_ip : ''}`,
        icon: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/1f6e1.png'
      })
    }
  }, [])

  const connectWS = useCallback(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      setTimeout(connectWS, 3000)
    }
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'playbook_update') {
        if (selectedIncident?.id === data.id) setPlaybook(data.playbook)
        return
      }
      setIncidents(prev => [data, ...prev].slice(0, 200))
      fetchStats()
      triggerAlert(data) // 🚨 Fire alert on every new incident
    }
  }, [fetchStats, selectedIncident, triggerAlert])

  useEffect(() => {
    connectWS()
    fetchStats()
    return () => wsRef.current?.close()
  }, [])

  const handleClear = async () => {
    await axios.delete(`${BACKEND_URL}/incidents/clear`)
    setIncidents([])
    setSelectedIncident(null)
    setPlaybook([])
    fetchStats()
  }

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident)
    setPlaybook(incident.playbook || [])
    setActiveTab('incidents')
  }

  const handleGeneratePlaybook = async () => {
    if (!selectedIncident) return
    setLoadingPlaybook(true)
    try {
      const res = await axios.get(`${BACKEND_URL}/incidents/${selectedIncident.id}/playbook`)
      setPlaybook(res.data.playbook || [])
    } catch (e) {}
    setLoadingPlaybook(false)
  }

  // ─── Show login page if not logged in ────────────────────────
  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(0,240,255,0.08), transparent 20%), radial-gradient(circle at top left, rgba(59,130,246,0.06), transparent 18%), linear-gradient(180deg, #020408 0%, #050a12 45%, #020408 100%)',
        color: '#ffffff',
        padding: '20px 28px'
      }}
    >
      {/* Toast Popup */}
      {toast && <Toast incident={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(5,10,18,0.96), rgba(9,16,26,0.98))',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '16px',
          marginBottom: '18px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '6px' }}>
            AI-Powered Security Operations Center
          </div>
          <div style={{ fontWeight: 800, fontSize: '28px', color: '#ffffff', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🛡️ Suraksha Kavach
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Premium SOC Dashboard for Threat Detection, Correlation & Response
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <a
            href="/attacker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255,51,102,0.1)',
              color: '#ff3366',
              border: '1px solid rgba(255,51,102,0.3)',
              padding: '10px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            ⚔️ Attack Console
          </a>

          <button
            onClick={handleClear}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            🗑️ Clear
          </button>

          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: connected ? '#00ff66' : '#ff3366',
              background: connected ? 'rgba(0,255,102,0.05)' : 'rgba(255,51,102,0.1)',
              border: `1px solid ${connected ? 'rgba(0,255,102,0.2)' : 'rgba(255,51,102,0.3)'}`,
              padding: '8px 16px',
              borderRadius: '20px',
              letterSpacing: '0.05em',
              boxShadow: connected ? '0 0 15px rgba(0,255,102,0.1)' : '0 0 15px rgba(255,51,102,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connected ? '#00ff66' : '#ff3366',
                boxShadow: connected ? '0 0 10px #00ff66' : '0 0 10px #ff3366'
              }}
            />
            {connected ? 'LIVE' : 'DISCONNECTED'}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              background: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Analytics Charts */}
      <SeverityChart incidents={incidents} stats={stats} />

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            {[
              { id: 'incidents', label: '🚨 Incidents' },
              { id: 'mitre', label: '📖 MITRE ATT&CK' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: activeTab === tab.id ? '#3b82f6' : 'rgba(9,16,26,0.9)',
                  color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: activeTab === tab.id ? '0 0 15px rgba(59,130,246,0.4)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'incidents' && (
            <IncidentFeed
              incidents={incidents}
              selectedId={selectedIncident?.id}
              onSelect={handleSelectIncident}
            />
          )}

          {activeTab === 'mitre' && (
            <MitrePanel incidents={incidents} />
          )}
        </div>

        <div>
          {selectedIncident ? (
            <PlaybookPanel
              incident={selectedIncident}
              playbook={playbook}
              loading={loadingPlaybook}
              onGenerate={handleGeneratePlaybook}
            />
          ) : (
            <div
              style={{
                background: '#09101a',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                No Incident Selected
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                Click any incident in the feed to view detailed analysis, MITRE mapping and generate an AI response playbook
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}