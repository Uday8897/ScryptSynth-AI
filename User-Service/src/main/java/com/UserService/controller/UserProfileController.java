package com.UserService.controller; // Use your actual package name (e.g., com.curatorai.userservice.controller)

import com.UserService.dto.UserProfileResponseDTO;
import com.UserService.dto.UserProfileUpdateDTO;
import com.UserService.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Add Slf4j for logging
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Import List

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j // Add Slf4j annotation
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        // Basic check for safety
        if (userDetails == null) {
            log.warn("Attempt to access /me endpoint without authentication.");
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        Long userId = Long.parseLong(userDetails.getUsername());
        log.info("Fetching profile for current user: {}", userId);
        return ResponseEntity.ok(userProfileService.getProfileById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateDTO updateDTO) {
        if (userDetails == null) {
            log.warn("Attempt to update profile without authentication.");
            return ResponseEntity.status(401).build();
        }
        Long userId = Long.parseLong(userDetails.getUsername());
        log.info("Updating profile for current user: {}", userId);
        return ResponseEntity.ok(userProfileService.updateProfile(userId, updateDTO));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDTO> getUserProfileById(@PathVariable Long userId) {
        // Note: This endpoint might need specific security based on requirements
        log.info("Fetching profile for user ID: {}", userId);
        return ResponseEntity.ok(userProfileService.getProfileById(userId));
    }

    // ==========================================================
    // NEW ENDPOINT TO GET ALL USERS
    // ==========================================================
    @GetMapping // Maps to GET /api/users
    public ResponseEntity<List<UserProfileResponseDTO>> getAllUsers() {
        log.info("Fetching list of all users.");
        List<UserProfileResponseDTO> users = userProfileService.getAllProfiles();
        return ResponseEntity.ok(users);
    }
    // ==========================================================

}