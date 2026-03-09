package com.example.websocket.service;

import com.example.websocket.dto.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simulates a persistent connection by pushing server-generated messages
 * to all subscribed clients on a schedule (heartbeat / server push demo).
 */
@Service
public class SimulatedPushScheduler {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConnectionTracker connectionTracker;
    // AtomicLong is used to increment the server tick counter in a thread-safe way.
    // Since scheduled tasks may be run concurrently (depending on configuration), AtomicLong ensures
    // that each increment of the counter is atomic and no ticks are missed or duplicated due to race conditions.
    // This guarantees accurate and reliable tick numbering, even under concurrent access.
    private final AtomicLong tick = new AtomicLong(0);

    public SimulatedPushScheduler(SimpMessagingTemplate messagingTemplate,
                                  ConnectionTracker connectionTracker) {
        this.messagingTemplate = messagingTemplate;
        this.connectionTracker = connectionTracker;
    }

    @Scheduled(fixedRate = 10000) // every 10 seconds
    public void pushServerTick() {
        if (connectionTracker.getCount() == 0) return;
        long n = tick.incrementAndGet();
        ChatMessage msg = new ChatMessage("system",
                "Server tick #" + n + " at " + Instant.now().toString());
        messagingTemplate.convertAndSend("/topic/messages", msg);
    }
}
