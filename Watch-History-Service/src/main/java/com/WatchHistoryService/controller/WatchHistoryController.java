package com.WatchHistoryService.controller; // Use your actual package name

import com.WatchHistoryService.dto.WatchHistoryRequestDTO;
import com.WatchHistoryService.dto.WatchHistoryResponseDTO;
import com.WatchHistoryService.dto.WatchlistItemDTO;
import com.WatchHistoryService.service.WatchHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Ensure RequestHeader is imported

import java.util.List;

@RestController
@RequestMapping("/api/history") // Base path for reviews/history
@RequiredArgsConstructor      // Use Lombok constructor injection
@Slf4j
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;

    // --- Review / History Endpoints ---

    @PostMapping
    public ResponseEntity<WatchHistoryResponseDTO> createHistoryLog(
            // Read the user ID from the header sent by the API Gateway
            @Valid @RequestBody WatchHistoryRequestDTO requestDTO) {


        // --- End Validation ---

        WatchHistoryResponseDTO createdLog = watchHistoryService.createWatchHistory(requestDTO);
        return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
    }

    // This endpoint remains the same - gets reviews for ANY user (public or internal)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WatchHistoryResponseDTO>> getReviewsForUser(@PathVariable String userId) {
        log.info("Received request to get reviews for user: {}", userId);
        List<WatchHistoryResponseDTO> history = watchHistoryService.getHistoryForUser(userId);
        return ResponseEntity.ok(history);
    }

    // Endpoint specifically for the logged-in user's reviews, identified by header
    @GetMapping("/my-reviews")
    public ResponseEntity<List<WatchHistoryResponseDTO>> getMyReviews(
            @RequestHeader("X-User-ID") String userId) { // Get userId from header

        log.info("Received request to get reviews for current user (ID from header: {})", userId);
        List<WatchHistoryResponseDTO> history = watchHistoryService.getHistoryForUser(userId);
        return ResponseEntity.ok(history);
    }


    // --- Watchlist Endpoints ---

    @PostMapping("/watchlist/{contentId}")
    public ResponseEntity<WatchlistItemDTO> addToWatchlist(
            @RequestHeader("X-User-ID") String userId, // Get userId from header
            @PathVariable String contentId) {

        log.info("Received request to add contentId: {} to watchlist for user from header: {}", contentId, userId);
        WatchlistItemDTO addedItem = watchHistoryService.addToWatchlist(userId, contentId);
        return new ResponseEntity<>(addedItem, HttpStatus.CREATED);
    }

    @DeleteMapping("/watchlist/{contentId}")
    public ResponseEntity<Void> removeFromWatchlist(
            @RequestHeader("X-User-ID") String userId, // Get userId from header
            @PathVariable String contentId) {

        log.info("Received request to remove contentId: {} from watchlist for user from header: {}", contentId, userId);
        watchHistoryService.removeFromWatchlist(userId, contentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/watchlist/my")
    public ResponseEntity<List<WatchlistItemDTO>> getMyWatchlist(
            @RequestHeader("X-User-ID") String userId) { // Get userId from header

        log.info("Received request to get watchlist for current user (ID from header: {})", userId);
        List<WatchlistItemDTO> watchlist = watchHistoryService.getWatchlistForUser(userId);
        return ResponseEntity.ok(watchlist);
    }
}