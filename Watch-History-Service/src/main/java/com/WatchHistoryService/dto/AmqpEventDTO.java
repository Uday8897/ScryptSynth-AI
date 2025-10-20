package com.WatchHistoryService.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AmqpEventDTO {
    private String userId;
    private String content; // A descriptive text for the AI to learn from
}