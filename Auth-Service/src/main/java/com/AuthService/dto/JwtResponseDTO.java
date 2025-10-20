package com.AuthService.dto;

import lombok.Data;

@Data
public class JwtResponseDTO {
    private String accessToken;
    private String displayName;
    private Long userId; // <-- ADD THIS

    public JwtResponseDTO(String accessToken, String displayName, Long userId) {
        this.accessToken = accessToken;
        this.displayName = displayName;
        this.userId = userId;
    }
}