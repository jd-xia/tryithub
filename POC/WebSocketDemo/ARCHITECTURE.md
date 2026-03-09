# WebSocket Demo — Architecture & Class Reference

This document explains each class and module in the **backend (Spring Boot)** and **frontend (React)** so you can understand how the app works end-to-end.

---

## Table of contents

1. [High-level flow](#high-level-flow)
2. [Backend (Spring Boot)](#backend-spring-boot)
3. [Frontend (React)](#frontend-react)
4. [How they connect](#how-they-connect)
5. [Data flow summary](#data-flow-summary)

---

## High-level flow

- **Frontend** runs at `http://localhost:5173` (Vite). User can **Connect** (STOMP over SockJS to `/ws`), **send chat messages**, and **call REST APIs** that broadcast to WebSocket clients.
- **Backend** runs at `http://localhost:8080` (Spring Boot). It exposes:
  - **WebSocket** at `/ws` (STOMP over SockJS): chat and server push.
  - **REST** under `/api`: broadcast message and get connection count.

Vite proxies `/api` and `/ws` to the backend so the browser talks to one origin.

---

## Backend (Spring Boot)

### 1. `WebSocketDemoApplication.java`

**Role:** Application entry point.

- **`@SpringBootApplication`** — Enables component scan and auto-configuration.
- **`@EnableScheduling`** — Enables `@Scheduled` methods (used by `SimulatedPushScheduler`).
- **`main`** — Starts the Spring Boot app (default port 8080).

---

### 2. `config/WebSocketConfig.java`

**Role:** Configures STOMP WebSocket and the message broker.

- **`@Configuration`** — Spring configuration class.
- **`@EnableWebSocketMessageBroker`** — Turns on STOMP over WebSocket and the message broker.

**`configureMessageBroker(MessageBrokerRegistry config)`**

- **`enableSimpleBroker("/topic", "/queue")`** — In-memory broker for destinations prefixed with `/topic` or `/queue`. Clients **subscribe** to e.g. `/topic/messages` to receive messages.
- **`setApplicationDestinationPrefixes("/app")`** — Messages sent from the client to destinations like `/app/chat` are routed to `@MessageMapping("/chat")` in the application.

**`registerStompEndpoints(StompEndpointRegistry registry)`**

- **`addEndpoint("/ws")`** — WebSocket endpoint; clients connect to `http://localhost:8080/ws` (or via proxy).
- **`setAllowedOriginPatterns("*")`** — Allows any origin (tighten in production).
- **`withSockJS()`** — Enables SockJS fallback so the connection works in environments where raw WebSocket is restricted.

**Result:** Clients connect to `/ws` (SockJS), then use STOMP to subscribe to `/topic/messages` and send to `/app/chat`.

---

### 3. `controller/WebSocketController.java`

**Role:** Handles STOMP messages sent from the client and broadcasts them to all subscribers.

- **`@Controller`** — Spring MVC controller (for message handling, not REST).

**`send(ChatMessage message)`**

- **`@MessageMapping("/chat")`** — Receives messages sent to **`/app/chat`** (application prefix + mapping).
- **`@SendTo("/topic/messages")`** — Return value is sent to everyone subscribed to `/topic/messages`.
- **Logic:** Takes the incoming `ChatMessage` (from, text, timestamp) and returns it as-is, so all subscribers (including the sender) see the same message. The frontend sends JSON that Spring deserializes into `ChatMessage`.

**Flow:** Browser → STOMP send to `/app/chat` → this method → broadcast to `/topic/messages` → all connected clients.

---

### 4. `controller/ApiController.java`

**Role:** REST API for broadcasting a message and getting the current WebSocket connection count.

- **`@RestController`** + **`@RequestMapping("/api")`** — All endpoints are under `/api`.
- **`MessageService`** — Injected for broadcast and connection count.

**`POST /api/broadcast`**

- **Body:** `BroadcastRequest` with a `message` field (JSON).
- **Action:** Calls `messageService.broadcast(request.getMessage())`, which sends a `ChatMessage` to `/topic/messages`.
- **Response:** `ApiResponse` with a success message (e.g. "Message broadcast to all connected clients").

**`GET /api/status`**

- **Action:** Returns `messageService.getConnectionCount()` in an `ApiResponse` (e.g. "Active WebSocket connections: 5").
- **Use:** Demo of server knowing how many STOMP sessions are active.

---

### 5. `service/MessageService.java`

**Role:** Central place to broadcast messages and read connection count.

- **`SimpMessagingTemplate`** — Spring’s API to send messages to STOMP destinations.
- **`ConnectionTracker`** — Holds the current number of connected sessions.

**`broadcast(String text)`**

- Builds a `ChatMessage` with `from = "server"` and the given `text`, then calls `messagingTemplate.convertAndSend("/topic/messages", msg)`. Every client subscribed to `/topic/messages` receives it (used by REST broadcast and by `SimulatedPushScheduler`).

**`getConnectionCount()`**

- Delegates to `connectionTracker.getCount()` for the REST status endpoint.

---

### 6. `service/ConnectionTracker.java`

**Role:** Keeps a running count of STOMP session connect/disconnect.

- **`@Component`** — Spring bean.
- **`AtomicInteger count`** — Thread-safe counter.

**`handleSessionConnected(SessionConnectedEvent event)`**

- **`@EventListener`** — Spring calls this when a STOMP session is established.
- **Action:** `count.incrementAndGet()`.

**`handleSessionDisconnected(SessionDisconnectEvent event)`**

- **`@EventListener`** — Spring calls this when a STOMP session ends (disconnect or close).
- **Action:** `count.decrementAndGet()`.

**`getCount()`**

- Returns the current value of `count` for the status API and for the scheduler (so we don’t push when nobody is connected).

---

### 7. `service/SimulatedPushScheduler.java`

**Role:** Demonstrates server push: periodically sends a “server tick” to all subscribed clients.

- **`@Service`** — Spring bean.
- **`SimpMessagingTemplate`** — To send to `/topic/messages`.
- **`ConnectionTracker`** — To skip sending when there are no connections.
- **`AtomicLong tick`** — Incrementing tick number for the message.

**`pushServerTick()`**

- **`@Scheduled(fixedRate = 10000)`** — Runs every 10 seconds.
- **Logic:** If `connectionTracker.getCount() == 0`, returns. Otherwise increments `tick`, builds a `ChatMessage` with `from = "system"` and text like `"Server tick #n at <timestamp>"`, and sends it to `/topic/messages`.

**Result:** Connected clients see periodic server-generated messages without sending anything.

---

### 8. DTOs

**`dto/ChatMessage.java`**

- **Fields:** `from`, `text`, `timestamp` (long, milliseconds).
- **Use:** Same shape for WebSocket chat and for server-generated messages. JSON-serialized over STOMP and in REST broadcast.

**`dto/BroadcastRequest.java`**

- **Field:** `message` (String).
- **Use:** Request body for `POST /api/broadcast`.

**`dto/ApiResponse.java`**

- **Field:** `message` (String).
- **Use:** JSON response for `/api/broadcast` and `/api/status`.

---

## Frontend (React)

### 1. `main.tsx`

**Role:** Entry point; mounts React and global error handling.

- Imports **`ErrorBoundary`** and **`App`**, and **`index.css`** for global styles.
- **`ReactDOM.createRoot(document.getElementById('root')!).render(...)`** — Renders into `#root` from `index.html`.
- **`<React.StrictMode>`** — Development checks (double-render, etc.).
- **`<ErrorBoundary><App /></ErrorBoundary>`** — Any uncaught error in the tree is caught by `ErrorBoundary`, which shows a message instead of a blank screen.

---

### 2. `App.tsx`

**Role:** Root UI and wiring of WebSocket state to the rest of the app.

- **`useWebSocket()`** — Custom hook that provides: `connected`, `messages`, `sendMessage`, `connect`, `disconnect`, `userName`, `setUserName`, `connectionError`, `connecting`.
- **Layout:**
  - **Header** — Title and subtitle.
  - **ConnectionPanel** — Connect/Disconnect, user name, connection status, and error message.
  - **Main grid:**
    - **Messages section:** **MessageList** (live messages) + **SendMessageForm** (send chat). Both depend on `connected` (e.g. send disabled when disconnected).
    - **API section:** **BroadcastApiPanel** — REST broadcast and status; disabled when not connected.

All WebSocket state lives in the hook; `App` only passes it down as props.

---

### 3. `hooks/useWebSocket.ts`

**Role:** Manages STOMP over SockJS: connect, disconnect, send chat, and receive messages.

- **State:** `connected`, `messages` (array of `ChatMessage`), `userName`, `connectionError`, `connecting`.
- **Ref:** `clientRef` — Holds the STOMP `Client` instance so it survives re-renders and can be deactivated on unmount.

**Connection:**

- **`WS_URL`** — In dev, `''` (same origin); in production, `VITE_WS_BASE_URL` or `''`. Final URL is `${WS_URL}/ws`.
- **`connect()`** — Async. Dynamically imports `@stomp/stompjs` and `sockjs-client`, creates a STOMP `Client` with:
  - **`webSocketFactory`** — `new SockJS(\`${WS_URL}/ws\`)` (SockJS to the same host or env URL).
  - **Broker:** Subscribes to **`/topic/messages`** on connect; each incoming message is parsed as `ChatMessage` and appended to `messages` (keeps last 99).
  - **Callbacks:** `onConnect`, `onDisconnect`, `onStompError`, `onWebSocketError`, `onWebSocketClose` update `connected` and `connectionError`.
- **`disconnect()`** — Deactivates the client, clears ref and connection state.

**Sending:**

- **`sendMessage(text)`** — If connected, publishes a JSON `ChatMessage` (from `userName`, text, no timestamp — server can add it) to **`/app/chat`**. Backend’s `WebSocketController` receives it and broadcasts to `/topic/messages`.

**Cleanup:**

- **`useEffect`** cleanup calls `clientRef.current?.deactivate()` on unmount.

**Constants:** `TOPIC = '/topic/messages'`, `SEND_PREFIX = '/app/chat'` — Must match backend `WebSocketConfig` and `WebSocketController`.

---

### 4. `types.ts`

**Role:** Shared TypeScript types.

- **`ChatMessage`** — `{ from: string; text: string; timestamp: number }`. Mirrors the backend DTO; used for incoming messages and for the payload sent to `/app/chat` (timestamp can be added by backend or client).

---

### 5. `components/ConnectionPanel.tsx`

**Role:** UI for connection state and user name.

- **Props:** `connected`, `connecting`, `userName`, `setUserName`, `onConnect`, `onDisconnect`, `connectionError`.
- **Shows:**
  - Title “Connection”.
  - Optional **connection error** message (e.g. backend not running).
  - Status dot + “Connected (persistent)” or “Disconnected”.
  - **Name** input (disabled when connected).
  - **Connect** button (disabled while `connecting`, label “Connecting…” or “Connect”) or **Disconnect** button when connected.
- **Styling:** `ConnectionPanel.css` (card, status dot, buttons).

---

### 6. `components/MessageList.tsx`

**Role:** Renders the list of chat messages.

- **Props:** `messages` (array of `ChatMessage`).
- **Behavior:** If empty, shows placeholder text. Otherwise maps each message to a row: **from**, **text**, and **time** (`toLocaleTimeString()` from `timestamp`).
- **Styling:** `MessageList.css`.

---

### 7. `components/SendMessageForm.tsx`

**Role:** Form to send one chat message.

- **Props:** `onSend(text: string)`, `disabled`.
- **State:** Local `text` for the input.
- **Submit:** Prevents default, trims, calls `onSend(text)` and clears input when not disabled.
- **UI:** Input + Send button; both can be disabled when not connected.
- **Styling:** `SendMessageForm.css`.

---

### 8. `components/BroadcastApiPanel.tsx`

**Role:** Calls REST API to broadcast a message and to get connection count.

- **Props:** `disabled` (e.g. when not connected).
- **State:** `message` (broadcast text), `status` (result or error string), `loading` (during broadcast).
- **`API_BASE`** — In dev, `''`; in production, `VITE_API_BASE_URL` or `''`. Requests go to `${API_BASE}/api/...`.
- **`callBroadcast()`** — `POST /api/broadcast` with body `{ message }`. On success, shows `ApiResponse.message`; on failure, shows error. Disables controls while `loading`.
- **`callStatus()`** — `GET /api/status`. Shows the returned `message` (e.g. “Active WebSocket connections: 3”).
- **UI:** Description, message input, “Broadcast via API” button, “Get connection count” button, and status/error text.
- **Styling:** `BroadcastApiPanel.css`.

---

### 9. `components/ErrorBoundary.tsx`

**Role:** Catches JavaScript errors in the child tree and shows a fallback UI.

- **Class component** — Implements `getDerivedStateFromError` and `componentDidCatch`.
- **State:** `hasError`, `error`.
- **On error:** Renders a red box with “Something went wrong”, the error message, and a hint to open the console. Logs the error and component stack in `componentDidCatch`.
- **Use:** Wraps `App` in `main.tsx` so a crash in any component doesn’t leave a blank page.

---

### 10. Other frontend files

- **`vite-env.d.ts`** — Vite client types; declares `ImportMeta.env` (e.g. `VITE_WS_BASE_URL`, `VITE_API_BASE_URL`) and `declare module 'sockjs-client'`.
- **`index.css`** — Global styles (e.g. body background, `#root`).
- **`App.css`** — Layout and card styles for the main app.
- **`*.css` in components** — Scoped styles for each component.

---

## How they connect

| What                | Backend                         | Frontend                          |
|---------------------|----------------------------------|------------------------------------|
| WebSocket endpoint  | `/ws` (SockJS + STOMP)           | Connect to `${WS_URL}/ws` (e.g. `/ws` with proxy) |
| Subscribe           | Broker `/topic/messages`         | `client.subscribe('/topic/messages', ...)` |
| Send chat           | `@MessageMapping("/chat")`       | Publish to `/app/chat`             |
| REST broadcast      | `POST /api/broadcast`            | `fetch('/api/broadcast', { body: { message } })` |
| REST status         | `GET /api/status`                | `fetch('/api/status')`             |
| Chat payload        | `ChatMessage` (from, text, timestamp) | Same shape in JSON                |

With Vite dev server, the browser uses `http://localhost:5173`; Vite proxies `/api` and `/ws` to `http://localhost:8080`, so the backend handles both.

---

## Data flow summary

1. **User clicks Connect**  
   Frontend loads STOMP + SockJS, connects to `/ws`, subscribes to `/topic/messages`, sets `connected = true`. Backend’s `ConnectionTracker` increments; `SimulatedPushScheduler` will start sending ticks to that client.

2. **User sends a chat message**  
   Frontend publishes JSON to `/app/chat`. `WebSocketController.send()` receives it and `@SendTo("/topic/messages")` broadcasts it. All subscribers (including sender) get the message; frontend appends to `messages` and `MessageList` re-renders.

3. **User clicks “Broadcast via API”**  
   Frontend calls `POST /api/broadcast`. `ApiController` uses `MessageService.broadcast()` → `SimpMessagingTemplate.convertAndSend("/topic/messages", msg)`. All WebSocket subscribers get a “server” message; frontend shows it in `MessageList` like any other message.

4. **Every 10 seconds**  
   `SimulatedPushScheduler.pushServerTick()` runs. If connection count > 0, it sends a “system” tick to `/topic/messages`. All connected clients receive it and display it in the list.

5. **User clicks “Get connection count”**  
   Frontend calls `GET /api/status`. `ApiController` returns `MessageService.getConnectionCount()` (from `ConnectionTracker`). Frontend displays the message in `BroadcastApiPanel`.

6. **User clicks Disconnect**  
   Frontend deactivates the STOMP client and clears state. Backend’s `SessionDisconnectEvent` fires; `ConnectionTracker` decrements.

This document should give you a clear picture of each class and how the frontend and backend work together.
