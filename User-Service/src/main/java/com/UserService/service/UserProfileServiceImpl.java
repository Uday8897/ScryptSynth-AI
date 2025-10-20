package com.UserService.service;

import com.UserService.dto.AmqpUserRegisteredDTO;
import com.UserService.dto.UserProfileResponseDTO;
import com.UserService.dto.UserProfileUpdateDTO;
import com.UserService.entity.UserProfile;
import com.UserService.exception.ResourceNotFoundException;
import com.UserService.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class UserProfileServiceImpl implements UserProfileService {
    private final UserProfileRepository userProfileRepository;
    @Override @Transactional
    public void createProfileFromEvent(AmqpUserRegisteredDTO event) {
        log.info("Received user registration event for userId: {}", event.getUserId());
        if (userProfileRepository.existsById(event.getUserId())) {
            log.warn("Profile for userId: {} already exists. Ignoring event.", event.getUserId());
            return;
        }
        UserProfile newProfile = new UserProfile();
        newProfile.setId(event.getUserId());
        newProfile.setUsername(event.getUsername());
        newProfile.setEmail(event.getEmail());
        newProfile.setDisplayName(event.getUsername());
        userProfileRepository.save(newProfile);
        log.info("Successfully created profile for userId: {}", event.getUserId());
    }
    @Override
    public UserProfileResponseDTO getProfileById(Long userId) {
        log.info("Fetching profile for userId: {}", userId);
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with id: " + userId));
        return mapToResponseDTO(userProfile);
    }
    @Override @Transactional
    public UserProfileResponseDTO updateProfile(Long userId, UserProfileUpdateDTO updateDTO) {
        log.info("Updating profile for userId: {}", userId);
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with id: " + userId));
        if (updateDTO.getDisplayName() != null) userProfile.setDisplayName(updateDTO.getDisplayName());
        if (updateDTO.getEmail() != null) userProfile.setEmail(updateDTO.getEmail());
        if (updateDTO.getSubscriptions() != null) userProfile.setSubscriptions(updateDTO.getSubscriptions());
        UserProfile updatedProfile = userProfileRepository.save(userProfile);
        log.info("Successfully updated profile for userId: {}", userId);
        return mapToResponseDTO(updatedProfile);
    }
    private UserProfileResponseDTO mapToResponseDTO(UserProfile entity) {
        UserProfileResponseDTO dto = new UserProfileResponseDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setDisplayName(entity.getDisplayName());
        dto.setSubscriptions(entity.getSubscriptions());
        return dto;
    }
    @Override
    public List<UserProfileResponseDTO> getAllProfiles() {
        log.info("Fetching all user profiles from repository.");
        return userProfileRepository.findAll() // Fetch all entities
                .stream()
                .map(this::mapToResponseDTO) // Use your existing mapper
                .collect(Collectors.toList());
    }
}