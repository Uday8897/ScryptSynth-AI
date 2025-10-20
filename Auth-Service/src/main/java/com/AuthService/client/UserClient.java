package com.AuthService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// The name "user-service" MUST match the spring.application.name in the User Service
@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/users/{userId}")
    UserProfileDTO getProfileById(@PathVariable("userId") Long userId);

    record UserProfileDTO(String displayName) {}
}