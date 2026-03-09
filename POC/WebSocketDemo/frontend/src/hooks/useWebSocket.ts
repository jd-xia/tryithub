// --- useWebSocket.ts: custom React hook — encapsulates all WebSocket/STOMP state and logic ---

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '../types'  // "import type" = type-only import, stripped at build time

// Vite env: DEV is true in dev server; VITE_* vars come from .env. Empty string = same origin (proxy).
const WS_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_WS_BASE_URL ?? '')
const TOPIC = '/topic/messages'   // STOMP topic we subscribe to for incoming messages
const SEND_PREFIX = '/app/chat'   // STOMP destination for sending chat messages

// type: like interface but for object shapes. Describes the STOMP client we use so TypeScript knows its methods.
type StompClient = {
  connected: boolean
  activate: () => void
  deactivate: () => void
  subscribe: (topic: string, cb: (frame: { body: string }) => void) => void
  publish: (opts: { destination: string; body: string }) => void
}

// Custom hook: name must start with "use". Returns state + functions; components that call this get the same pattern.
export function useWebSocket() {
  // useState(initial): returns [value, setter]. When you call setter, React re-renders components using this state.
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])  // <ChatMessage[]> = array of ChatMessage (generic type)
  const [userName, setUserName] = useState('user')
  const [connectionError, setConnectionError] = useState<string | null>(null)  // string | null = either type
  const [connecting, setConnecting] = useState(false)
  // useRef: holds a value across re-renders without triggering re-render when it changes. Used for the STOMP client instance.
  const clientRef = useRef<StompClient | null>(null)

  // useCallback: memoizes the function so it keeps the same reference (useful for dependency arrays and preventing unnecessary re-renders).
  // Empty dependency [] = this function is created once and never recreated.
  const connect = useCallback(async () => {
    if (clientRef.current && 'connected' in clientRef.current && clientRef.current.connected) return
    setConnectionError(null)
    setConnecting(true)

    try {
      // Dynamic import: load STOMP + SockJS only when user clicks Connect (smaller initial bundle).
      const [{ Client }, SockJS] = await Promise.all([
        import('@stomp/stompjs'),
        import('sockjs-client'),
      ])
      const client = new Client({
        webSocketFactory: () => new (SockJS.default || SockJS)(`${WS_URL}/ws`) as unknown as WebSocket,
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setConnected(true)
          setConnectionError(null)
          // Subscribe to topic; each message calls this callback with frame.body (JSON string).
          client.subscribe(TOPIC, (frame) => {
            try {
              const body = JSON.parse(frame.body) as ChatMessage  // as ChatMessage = type assertion
              // setMessages with function: "prev" is current state. We keep last 99 + new one to avoid unbounded growth.
              setMessages((prev) => [...prev.slice(-99), body])  // [...arr, x] = new array with x appended
            } catch {
              // ignore parse errors
            }
          })
        },
        onDisconnect: () => setConnected(false),
        onStompError: () => setConnected(false),
        onWebSocketError: () => {
          setConnected(false)
          setConnectionError('WebSocket error. Is the backend running on port 8080?')
        },
        onWebSocketClose: () => setConnected(false),
      })

      client.activate()
      clientRef.current = client  // store in ref so sendMessage and disconnect can use it
    } catch (e) {
      setConnectionError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()  // ?. = optional chaining; no-op if current is null
    clientRef.current = null
    setConnected(false)
    setConnectionError(null)
  }, [])

  // useCallback with [userName]: function is recreated when userName changes, so publish always has latest name.
  const sendMessage = useCallback(
    (text: string) => {
      if (!clientRef.current?.connected || !text.trim()) return
      clientRef.current.publish({
        destination: SEND_PREFIX,
        body: JSON.stringify({ from: userName, text: text.trim() }),
      })
    },
    [userName]
  )

  // useEffect with empty []: run cleanup on unmount (user navigates away or component is removed). Cleanup = disconnect.
  useEffect(() => {
    return () => {
      clientRef.current?.deactivate()
    }
  }, [])

  return {
    connected,
    messages,
    sendMessage,
    connect,
    disconnect,
    userName,
    setUserName,
    connectionError,
    connecting,
  }
}
