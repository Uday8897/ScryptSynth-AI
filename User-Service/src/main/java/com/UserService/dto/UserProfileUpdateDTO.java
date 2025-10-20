package com.UserService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UserProfileUpdateDTO {
    @Email(message = "Email should be valid")
    private String email;
    @Size(min = 2, max = 50)
    private String displayName;
    private List<String> subscriptions;
}