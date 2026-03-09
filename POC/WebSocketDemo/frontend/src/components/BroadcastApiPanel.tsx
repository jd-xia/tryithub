import { useState } from 'react'
import './BroadcastApiPanel.css'

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '')

// Inline props type: { disabled: boolean } instead of a separate interface (fine for one or two props).
export function BroadcastApiPanel({ disabled }: { disabled: boolean }) {
  const [message, setMessage] = useState('Hello from REST API!')
  const [status, setStatus] = useState<string | null>(null)  // null = no response yet
  const [loading, setLoading] = useState(false)

  // async function: can use "await" inside. fetch returns a Promise; await waits for the response.
  const callBroadcast = async () => {
    if (disabled || !message.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`${API_BASE}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      const data = await res.json()
      setStatus(res.ok ? data.message : `Error: ${data.message || res.statusText}`)
    } catch (e) {
      setStatus('Request failed: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setLoading(false)  // runs whether try succeeds or catch runs
    }
  }

  const callStatus = async () => {
    setStatus(null)
    try {
      const res = await fetch(`${API_BASE}/api/status`)
      const data = await res.json()
      setStatus(data.message)
    } catch (e) {
      setStatus('Request failed: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return (
    <div className="broadcast-panel">
      <p className="broadcast-desc">
        Call the REST API to broadcast a message to all connected WebSocket clients.
      </p>
      <div className="broadcast-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message to broadcast"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={callBroadcast}
          disabled={disabled || loading || !message.trim()}
        >
          {loading ? 'Sending…' : 'Broadcast via API'}
        </button>
      </div>
      <button type="button" className="btn-secondary" onClick={callStatus}>
        Get connection count
      </button>
      {status != null && <p className="api-status">{status}</p>}
    </div>
  )
}
