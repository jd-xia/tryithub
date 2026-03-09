// --- App.tsx: root component — composes smaller components and wires up the WebSocket hook ---

import { useWebSocket } from './hooks/useWebSocket'
import { ConnectionPanel } from './components/ConnectionPanel'
import { MessageList } from './components/MessageList'
import { SendMessageForm } from './components/SendMessageForm'
import { BroadcastApiPanel } from './components/BroadcastApiPanel'
import './App.css'

// Function component: a function that returns JSX. When state in useWebSocket changes, React re-runs this and re-renders.
function App() {
  // Custom hook: holds all WebSocket state and logic. Destructuring = pull out named values from the returned object.
  const {
    connected,
    messages,
    sendMessage,
    connect,
    disconnect,
    userName,
    setUserName,
    connectionError,
    connecting,
  } = useWebSocket()

  // return: the JSX (HTML-like syntax) React will render. Use className, not class (class is reserved in JS).
  return (
    <div className="app">
      <header className="app-header">
        <h1>WebSocket Demo</h1>
        <p className="subtitle">React + Spring Boot · Persistent connection</p>
      </header>

      {/* Props: pass data and callbacks into child components. "onConnect" etc. are callback props (functions). */}
      <ConnectionPanel
        connected={connected}
        connecting={connecting}
        userName={userName}
        setUserName={setUserName}
        onConnect={connect}
        onDisconnect={disconnect}
        connectionError={connectionError}
      />

      <div className="main-grid">
        <section className="card messages-section">
          <h2>Messages (live stream)</h2>
          {/* messages is an array; MessageList will map over it to show each message */}
          <MessageList messages={messages} />
          {/* disabled={!connected} = Send button disabled when not connected (React expression in curly braces) */}
          <SendMessageForm onSend={sendMessage} disabled={!connected} />
        </section>

        <section className="card api-section">
          <h2>REST API + WebSocket</h2>
          <BroadcastApiPanel disabled={!connected} />
        </section>
      </div>
    </div>
  )
}

// default export: when another file does "import App from './App'", they get this component
export default App
