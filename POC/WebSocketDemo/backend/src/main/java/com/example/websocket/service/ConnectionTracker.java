package com.example.websocket.service;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * ConnectionTracker tracks the number of active WebSocket connections.
 *
 * It listens for Spring WebSocket events:
 * - When a client connects (SessionConnectedEvent), it increments the count.
 * - When a client disconnects (SessionDisconnectEvent), it decrements the count.
 *
 * The current count can be retrieved with getCount().
 *
 * This is used (for example) to know if any clients are currently connected, such as
 * for deciding whether to send push/heartbeat messages.
 */

@Component
public class ConnectionTracker {

    private final AtomicInteger count = new AtomicInteger(0);

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        count.incrementAndGet();
    }

    @EventListener
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        count.decrementAndGet();
    }

    public int getCount() {
        return count.get();
    }
}
