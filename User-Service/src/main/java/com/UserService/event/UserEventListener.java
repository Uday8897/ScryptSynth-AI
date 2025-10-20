package com.UserService.event;


import com.UserService.dto.AmqpUserRegisteredDTO;
import com.UserService.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor @Slf4j
public class UserEventListener {
    private final UserProfileService userProfileService;
    @RabbitListener(queues = "${amqp.queue}")
    public void handleUserRegistration(AmqpUserRegisteredDTO event) {
        try {
            userProfileService.createProfileFromEvent(event);
        } catch (Exception e) {
            log.error("Failed to process user registration event for userId: {}. Error: {}", event != null ? event.getUserId() : "null", e.getMessage());
        }
    }
}