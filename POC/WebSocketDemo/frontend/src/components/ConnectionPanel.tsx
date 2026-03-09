import './ConnectionPanel.css'

// Props type: defines what the parent must pass. "?" = optional (connecting has a default below).
interface ConnectionPanelProps {
  connected: boolean
  connecting?: boolean
  userName: string
  setUserName: (name: string) => void  // function that takes a string; parent passes setUserName from useState
  onConnect: () => void
  onDisconnect: () => void
  connectionError: string | null
}

// Destructuring props in the parameter: instead of (props) and then props.connected, we get named variables.
// "connecting = false" = default value if parent doesn't pass connecting.
export function ConnectionPanel({
  connected,
  connecting = false,
  userName,
  setUserName,
  onConnect,
  onDisconnect,
  connectionError,
}: ConnectionPanelProps) {
  return (
    <div className="connection-panel card">
      <h2 className="connection-panel-title">Connection</h2>
      {/* Conditional render: only show <p> when connectionError is truthy. role="alert" for screen readers. */}
      {connectionError && (
        <p className="connection-error" role="alert">{connectionError}</p>
      )}
      <div className="connection-row">
        {/* Template literal in className: `...${...}` builds "status-dot connected" or "status-dot disconnected" */}
        <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span className="status-text">
          {connected ? 'Connected (persistent)' : 'Disconnected'}
        </span>
      </div>
      <div className="connection-actions">
        <label className="name-label">
          Name
          {/* Controlled input: value comes from state (userName), onChange updates state so React owns the value. */}
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}  // e = synthetic event; e.target.value = current input text
            placeholder="Your name"
            disabled={connected}  // can't change name while connected
          />
        </label>
        {/* Ternary: show Disconnect button when connected, else show Connect button. */}
        {connected ? (
          <button type="button" className="btn btn-danger" onClick={onDisconnect}>
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}
