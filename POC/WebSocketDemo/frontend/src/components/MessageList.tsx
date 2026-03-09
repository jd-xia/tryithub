import type { ChatMessage } from '../types'
import './MessageList.css'

interface MessageListProps {
  messages: ChatMessage[]
}

// Presentational component: receives data via props, no local state. Just renders what it's given.
export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="message-list">
      {/* If no messages, show empty state; otherwise map array to JSX. */}
      {messages.length === 0 ? (
        <p className="message-list-empty">No messages yet. Connect and send or wait for server ticks.</p>
      ) : (
        // .map(): turn each message into a <div>. key is required by React for list items (helps reconciliation).
        messages.map((msg, i) => (
          <div key={i} className="message-item">
            <span className="message-from">{msg.from}:</span>
            <span className="message-text">{msg.text}</span>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
