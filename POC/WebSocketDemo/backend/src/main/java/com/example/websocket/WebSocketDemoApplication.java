package com.example.websocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


// The @EnableScheduling annotation tells Spring Boot to look for methods annotated with @Scheduled
// anywhere in the application context and run them according to their configured schedule.
// This enables tasks like periodic pushes, heartbeats, or automated jobs to run in the background.
// In this project, it is used (for example) by classes like SimulatedPushScheduler to broadcast messages at intervals.

@SpringBootApplication
@EnableScheduling
public class WebSocketDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebSocketDemoApplication.class, args);
    }
}
