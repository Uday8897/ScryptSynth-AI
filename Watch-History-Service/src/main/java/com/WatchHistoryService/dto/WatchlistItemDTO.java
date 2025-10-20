package com.WatchHistoryService.dto;
import lombok.Data;
import java.time.Instant;

@Data
public class WatchlistItemDTO {
    private Long id;
    private String userId;
    private String contentId;
    private Instant addedAt;
    // You might add movie details here later by calling Content-Search service
}