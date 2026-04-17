import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import StatsBar from './components/StatsBar'
import IncidentFeed from './components/IncidentFeed'
import MitrePanel from './components/MitrePanel'
import PlaybookPanel from './components/PlaybookPanel'
import SeverityChart from './components/SeverityChart'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const WS_URL = BACKEND_URL.replace('http', 'ws') + '/ws'

export default function App() {
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
    }
  }, [fetchStats, selectedIncident])

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(0,240,255,0.08), transparent 20%), radial-gradient(circle at top left, rgba(59,130,246,0.06), transparent 18%), linear-gradient(180deg, #020408 0%, #050a12 45%, #020408 100%)',
        color: '#ffffff',
        padding: '20px 28px'
      }}
    >
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
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* ✅ Analytics Charts Row — Confidence Timeline + Severity Distribution */}
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