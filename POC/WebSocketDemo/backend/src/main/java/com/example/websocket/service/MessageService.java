package com.example.websocket.service;

import com.example.websocket.dto.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * MessageService is a service class that provides methods to broadcast messages
 * to all connected WebSocket clients and to get the current connection count.
 */
@Service
public class MessageService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConnectionTracker connectionTracker;

    public MessageService(SimpMessagingTemplate messagingTemplate, ConnectionTracker connectionTracker) {
        this.messagingTemplate = messagingTemplate;
        this.connectionTracker = connectionTracker;
    }

    public void broadcast(String text) {
        ChatMessage msg = new ChatMessage("server", text);
        messagingTemplate.convertAndSend("/topic/messages", msg);
    }

    public int getConnectionCount() {
        return connectionTracker.getCount();
    }
}
