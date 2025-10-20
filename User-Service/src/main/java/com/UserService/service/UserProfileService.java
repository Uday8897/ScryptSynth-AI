package com.UserService.service;



import com.UserService.dto.AmqpUserRegisteredDTO;
import com.UserService.dto.UserProfileResponseDTO;
import com.UserService.dto.UserProfileUpdateDTO;

import java.util.List;

public interface UserProfileService {
    void createProfileFromEvent(AmqpUserRegisteredDTO event);
    UserProfileResponseDTO getProfileById(Long userId);
    UserProfileResponseDTO updateProfile(Long userId, UserProfileUpdateDTO updateDTO);

    List<UserProfileResponseDTO> getAllProfiles();
}