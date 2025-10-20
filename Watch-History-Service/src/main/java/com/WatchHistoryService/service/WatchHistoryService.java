package com.WatchHistoryService.service;


import com.WatchHistoryService.dto.WatchHistoryRequestDTO;
import com.WatchHistoryService.dto.WatchHistoryResponseDTO;
import com.WatchHistoryService.dto.WatchlistItemDTO;

import java.util.List;

public interface WatchHistoryService {
    WatchHistoryResponseDTO createWatchHistory(WatchHistoryRequestDTO requestDTO);
    List<WatchHistoryResponseDTO> getHistoryForUser(String userId);
    // Add these methods to the interface
    WatchlistItemDTO addToWatchlist(String userId, String contentId);
    void removeFromWatchlist(String userId, String contentId);
    List<WatchlistItemDTO> getWatchlistForUser(String userId);
}
