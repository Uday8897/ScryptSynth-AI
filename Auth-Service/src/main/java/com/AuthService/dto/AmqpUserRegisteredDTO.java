package com.AuthService.dto;

import lombok.*;

@Data @AllArgsConstructor
public class AmqpUserRegisteredDTO {
    private Long userId;
    private String username;
    private String email;
}