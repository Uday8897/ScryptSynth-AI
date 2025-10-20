package com.UserService.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data @JsonIgnoreProperties(ignoreUnknown = true)
public class AmqpUserRegisteredDTO {
    private Long userId;
    private String username;
    private String email;
}