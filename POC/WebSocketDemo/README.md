# WebSocket Demo

A sample project demonstrating **persistent WebSocket connection** with a **REST API** integration.

- **Frontend:** React (Vite) + STOMP over WebSocket (`@stomp/stompjs`, `sockjs-client`)
- **Backend:** Spring Boot 3 with WebSocket (STOMP) support


## Features

- **Persistent connection:** Connect once; messages stream over the same WebSocket.
- **REST API + WebSocket:** `POST /api/broadcast` sends a message to all connected clients via WebSocket.
- **Simulated server push:** Backend sends a "server tick" every 10 seconds to all subscribed clients (simulates heartbeat/server push).
- **Live chat:** Send messages from the UI; they are broadcast to all connected clients.

## Quick Start

### 1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Or with Maven installed:

```bash
cd backend
mvn spring-boot:run
```

Server runs at **http://localhost:8080**.

- WebSocket endpoint: `http://localhost:8080/ws` (SockJS)
- REST API: `http://localhost:8080/api/broadcast`, `http://localhost:8080/api/status`

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**. Vite proxies `/api` and `/ws` to the backend, so no CORS setup is needed in dev.

### 3. Try it

1. Open http://localhost:5173 and click **Connect**.
2. Send a message from the form — it appears for all connected clients.
3. Use **Broadcast via API** to send a message via REST; it appears in the WebSocket stream.
4. Wait ~10 seconds — you’ll see **server tick** messages (simulated persistent push).

## Project structure

```
WebSocketDemo/
├── backend/                    # Spring Boot
│   ├── src/main/java/.../
│   │   ├── config/WebSocketConfig.java   # STOMP + SockJS
│   │   ├── controller/
│   │   │   ├── ApiController.java        # REST: /api/broadcast, /api/status
│   │   │   └── WebSocketController.java # STOMP /app/chat -> /topic/messages
│   │   ├── service/
│   │   │   ├── MessageService.java
│   │   │   ├── ConnectionTracker.java
│   │   │   └── SimulatedPushScheduler.java  # Every 10s push to /topic/messages
│   │   └── dto/
│   └── pom.xml
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── hooks/useWebSocket.ts   # STOMP client, subscribe /topic/messages
│   │   ├── components/            # ConnectionPanel, MessageList, BroadcastApiPanel
│   │   └── App.tsx
│   ├── vite.config.ts             # Proxy /api and /ws to backend
│   └── package.json
└── README.md
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/broadcast` | Body: `{ "message": "text" }`. Broadcasts to all WebSocket subscribers. |
| GET | `/api/status` | Returns active WebSocket connection count. |

## WebSocket (STOMP)

- **Endpoint:** `/ws` (SockJS), then STOMP over WebSocket.
- **Subscribe:** `/topic/messages` — all chat and server-push messages.
- **Send:** `/app/chat` with body `{ "from": "name", "text": "message" }`.

The backend also pushes a system message to `/topic/messages` every 10 seconds to simulate a persistent server connection.
