package com.UserService.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private List<String> subscriptions;
}