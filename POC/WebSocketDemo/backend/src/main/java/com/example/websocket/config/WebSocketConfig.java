package com.example.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig configures WebSocket messaging for the Spring Boot application.
 *
 * - Enables WebSocket message broker with @EnableWebSocketMessageBroker.
 * - Configures the message broker to use "/topic" and "/queue" for broadcasting support,
 *   and sets application destination prefixes to "/app" (so controller message-mapping
 *   methods are mapped to "/app/...").
 * - Registers the "/ws" STOMP endpoint and enables SockJS fallback for browsers lacking native WebSocket support.
 * - Allows all CORS origins for development/demo purposes via setAllowedOriginPatterns("*").
 *
 * This configuration allows clients to connect to "/ws" using STOMP over WebSocket/SockJS,
 * subscribe to broadcast topics (like "/topic/messages"), and send messages with destinations
 * prefixed by "/app" to be handled by @MessageMapping methods.
 */


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
