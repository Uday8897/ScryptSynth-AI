package com.WatchHistoryService.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class WatchHistoryResponseDTO {
    private Long id;
    private String userId;
    private String contentId;
    private Integer rating;
    private String reviewText;
    private Instant watchedAt;
}