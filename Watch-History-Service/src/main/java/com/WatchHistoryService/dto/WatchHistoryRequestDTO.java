package com.WatchHistoryService.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class WatchHistoryRequestDTO {
    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    @NotBlank(message = "Content ID cannot be blank")
    private String contentId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 10, message = "Rating must be at most 10")
    private Integer rating;

    private String reviewText;
}