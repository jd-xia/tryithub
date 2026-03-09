package com.example.websocket.controller;

import com.example.websocket.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;


/**
 * This controller method handles incoming WebSocket messages sent by clients to the destination "/app/chat".
 * 
 * - @MessageMapping("/chat"): Maps messages sent to "/app/chat" to this handler method.
 * - @SendTo("/topic/messages"): Broadcasts the return value (the ChatMessage) to all subscribers of "/topic/messages".
 * - The method receives a ChatMessage object sent from the client, and simply returns it to be broadcasted to all connected clients.
 * 
 * This provides a simple chat relay where every message sent via WebSocket is broadcast to all users.
 */

@Controller
public class WebSocketController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage send(ChatMessage message) {
        return message;
    }
}
