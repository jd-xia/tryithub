package com.example.websocket.controller;

import com.example.websocket.dto.BroadcastRequest;
import com.example.websocket.dto.ApiResponse;
import com.example.websocket.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final MessageService messageService;

    public ApiController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * REST API: Broadcast a message to all connected WebSocket clients.
     * Demonstrates API + WebSocket integration.
     */
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse> broadcast(@RequestBody BroadcastRequest request) {
        messageService.broadcast(request.getMessage());
        return ResponseEntity.ok(new ApiResponse("Message broadcast to all connected clients"));
    }

    /**
     * Health check and connection count (for demo).
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse> status() {
        int count = messageService.getConnectionCount();
        return ResponseEntity.ok(new ApiResponse("Active WebSocket connections: " + count));
    }
}
