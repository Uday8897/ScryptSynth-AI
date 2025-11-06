package com.WatchHistoryService.service;

import com.WatchHistoryService.client.ContentServiceClient;
import com.WatchHistoryService.config.AmqpConfigProperties;
import com.WatchHistoryService.dto.AmqpEventDTO;
import com.WatchHistoryService.dto.ContentDetails;
import com.WatchHistoryService.dto.WatchHistoryRequestDTO;
import com.WatchHistoryService.dto.WatchHistoryResponseDTO;
import com.WatchHistoryService.dto.WatchlistItemDTO;
import com.WatchHistoryService.entity.WatchHistory;
import com.WatchHistoryService.entity.WatchlistItem;
import com.WatchHistoryService.exception.ResourceNotFoundException;
import com.WatchHistoryService.repository.WatchHistoryRepository;
import com.WatchHistoryService.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WatchHistoryServiceImpl implements WatchHistoryService {

    private final WatchHistoryRepository historyRepository;
    private final WatchlistRepository watchlistRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AmqpConfigProperties amqpConfigProperties;
    private final ContentServiceClient contentServiceClient; // Add Feign client

    // --- Review / History Methods ---

    @Override
    @Transactional
    public WatchHistoryResponseDTO createWatchHistory(WatchHistoryRequestDTO requestDTO) {
        log.info("Attempting to create watch history for user: {}, content: {}", requestDTO.getUserId(), requestDTO.getContentId());
        WatchHistory history = mapToHistoryEntity(requestDTO);
        WatchHistory savedHistory;
        try {
            savedHistory = historyRepository.save(history);
            log.info("Successfully saved watch history with ID: {}", savedHistory.getId());
        } catch (Exception e) {
            log.error("Error saving watch history for user: {}, content: {}. Error: {}", requestDTO.getUserId(), requestDTO.getContentId(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save watch history.", e);
        }

        // Publish event for AI service after successful save
        publishActivityEvent(savedHistory);

        return mapToHistoryResponseDTO(savedHistory);
    }

    @Override
    public List<WatchHistoryResponseDTO> getHistoryForUser(String userId) {
        log.info("Fetching watch history for user: {}", userId);
        try {
            return historyRepository.findByUserIdOrderByWatchedAtDesc(userId)
                    .stream()
                    .map(this::mapToHistoryResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching watch history for user: {}. Error: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch watch history.", e);
        }
    }

    private void publishActivityEvent(WatchHistory history) {
        try {
            // Fetch content details using Feign client
            ContentDetails contentDetails = fetchContentDetails(history.getContentId());

            // Create enhanced event with rich context for AI
            AmqpEventDTO event = AmqpEventDTO.builder()
                    .type(determineEventType(history))
                    .userId(history.getUserId())
                    .contentId(history.getContentId())
                    .contentType("movie")
                    .contentTitle(contentDetails.getTitle())
                    .contentDescription(contentDetails.getDescription())
                    .rating(history.getRating())
                    .reviewText(history.getReviewText())
                    .timestamp(Instant.now().toString())
                    .build();

            // Generate AI-optimized content
            String aiContent = generateAIContent(event, contentDetails);
            event.setContentDescription(aiContent);

            // Send the enhanced DTO to RabbitMQ
            rabbitTemplate.convertAndSend(amqpConfigProperties.getExchange(), amqpConfigProperties.getRoutingKey(), event);
            log.info("🎯 Published AI-enhanced activity event for user: {}, content: {}, type: {}",
                    history.getUserId(), contentDetails.getTitle(), event.getType());
        } catch (Exception e) {
            log.error("❌ Failed to publish user activity event for user: {}. Error: {}", history.getUserId(), e.getMessage());
            // Just log for decoupling - don't throw exception
        }
    }

    private ContentDetails fetchContentDetails(String contentId) {
        try {
            log.info("🔍 Fetching content details for ID: {}", contentId);
            ContentDetails contentDetails = contentServiceClient.getContentDetails(contentId);

            if (contentDetails != null && contentDetails.getTitle() != null) {
                log.info("✅ Successfully fetched content details: {}", contentDetails.getTitle());
                return contentDetails;
            } else {
                log.warn("⚠️ Content details not found for ID: {}, using fallback", contentId);
                return createFallbackContentDetails(contentId);
            }

        } catch (Exception e) {
            log.warn("⚠️ Could not fetch content details for ID: {}. Using fallback. Error: {}", contentId, e.getMessage());
            return createFallbackContentDetails(contentId);
        }
    }

    private ContentDetails createFallbackContentDetails(String contentId) {
        return ContentDetails.builder()
                .id(contentId)
                .title("Unknown Movie")
                .description("Content details not available")
                .genres(List.of("Unknown"))
                .build();
    }

    private String determineEventType(WatchHistory history) {
        if (history.getReviewText() != null && !history.getReviewText().trim().isEmpty()) {
            return "review_added";
        } else if (history.getRating() != null) {
            return "rating_added";
        } else {
            return "content_viewed";
        }
    }

    private String generateAIContent(AmqpEventDTO event, ContentDetails contentDetails) {
        StringBuilder aiContent = new StringBuilder();

        // User action context
        aiContent.append(String.format("User %s for '%s' (ID: %s)",
                getActionDescription(event.getType()),
                contentDetails.getTitle(),
                event.getContentId()));

        // Rating context
        if (event.getRating() != null) {
            aiContent.append(String.format(". Rated %d/10", event.getRating()));
            if (event.getRating() >= 8) {
                aiContent.append(" (high rating indicating strong preference)");
            } else if (event.getRating() <= 5) {
                aiContent.append(" (low rating indicating dislike)");
            }
        }

        // Review context
        if (event.getReviewText() != null && !event.getReviewText().trim().isEmpty()) {
            aiContent.append(String.format(". User review: \"%s\"", event.getReviewText()));

            // Add sentiment hints for AI
            String reviewLower = event.getReviewText().toLowerCase();
            if (reviewLower.contains("love") || reviewLower.contains("amazing") || reviewLower.contains("excellent") || reviewLower.contains("awesome")) {
                aiContent.append(" (positive sentiment detected)");
            } else if (reviewLower.contains("hate") || reviewLower.contains("terrible") || reviewLower.contains("boring") || reviewLower.contains("disappointing")) {
                aiContent.append(" (negative sentiment detected)");
            }
        }

        // Content context for AI understanding
        if (contentDetails.getDescription() != null && !contentDetails.getDescription().isEmpty()) {
            aiContent.append(String.format(". Content details: %s", contentDetails.getDescription()));
        }

        // Genre context for preference analysis
        if (contentDetails.getGenres() != null && !contentDetails.getGenres().isEmpty()) {
            aiContent.append(String.format(". Genres: %s", String.join(", ", contentDetails.getGenres())));
        }

        return aiContent.toString();
    }

    private String getActionDescription(String eventType) {
        switch (eventType) {
            case "review_added": return "wrote a detailed review";
            case "rating_added": return "added a rating";
            case "content_viewed": return "viewed content";
            default: return "performed action on";
        }
    }

    // --- Watchlist Methods ---

    @Override
    @Transactional
    public WatchlistItemDTO addToWatchlist(String userId, String contentId) {
        log.info("Attempting to add contentId: {} to watchlist for user: {}", contentId, userId);
        if (watchlistRepository.existsByUserIdAndContentId(userId, contentId)) {
            log.warn("Item {} already exists in watchlist for user {}. Skipping add.", contentId, userId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Item already exists in watchlist.");
        }
        WatchlistItem item = new WatchlistItem(userId, contentId);
        WatchlistItem savedItem;
        try {
            savedItem = watchlistRepository.save(item);
            log.info("Successfully added item with id: {} to watchlist for user {}.", savedItem.getId(), userId);

            // Publish watchlist event for AI service
            publishWatchlistEvent(userId, contentId, "added");

        } catch (Exception e) {
            log.error("Error adding item {} to watchlist for user {}. Error: {}", contentId, userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to add item to watchlist.", e);
        }
        return mapToWatchlistDTO(savedItem);
    }

    private void publishWatchlistEvent(String userId, String contentId, String action) {
        try {
            // Fetch content details using Feign client
            ContentDetails contentDetails = fetchContentDetails(contentId);

            // Create watchlist event for AI
            AmqpEventDTO event = AmqpEventDTO.builder()
                    .type("watchlist_" + action)
                    .userId(userId)
                    .contentId(contentId)
                    .contentType("movie")
                    .contentTitle(contentDetails.getTitle())
                    .contentDescription(contentDetails.getDescription())
                    .action(action)
                    .timestamp(Instant.now().toString())
                    .build();

            // Generate AI-optimized content
            String aiContent = String.format(
                    "User %s '%s' (ID: %s) to their watchlist. %s Genres: %s. This indicates strong interest in this content.",
                    action,
                    contentDetails.getTitle(),
                    contentId,
                    contentDetails.getDescription() != null ? "Content: " + contentDetails.getDescription() + "." : "",
                    contentDetails.getGenres() != null ? String.join(", ", contentDetails.getGenres()) : "Unknown"
            );
            event.setContentDescription(aiContent);

            // Send to RabbitMQ
            rabbitTemplate.convertAndSend(amqpConfigProperties.getExchange(), amqpConfigProperties.getRoutingKey(), event);
            log.info("⭐ Published watchlist {} event for user: {}, content: {}", action, userId, contentDetails.getTitle());

        } catch (Exception e) {
            log.error("❌ Failed to publish watchlist event for user: {}, content: {}. Error: {}", userId, contentId, e.getMessage());
        }
    }

    @Override
    @Transactional
    public void removeFromWatchlist(String userId, String contentId) {
        log.info("Attempting to remove contentId: {} from watchlist for user: {}", contentId, userId);
        if (!watchlistRepository.existsByUserIdAndContentId(userId, contentId)) {
            log.warn("Item {} not found in watchlist for user {}. Skipping remove.", contentId, userId);
            throw new ResourceNotFoundException("Item not found in watchlist.");
        }
        try {
            watchlistRepository.deleteByUserIdAndContentId(userId, contentId);
            log.info("Successfully removed item {} from watchlist for user {}.", contentId, userId);

            // Publish watchlist removal event for AI service
            publishWatchlistEvent(userId, contentId, "removed");

        } catch (Exception e) {
            log.error("Error removing item {} from watchlist for user {}. Error: {}", contentId, userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to remove item from watchlist.", e);
        }
    }

    @Override
    public List<WatchlistItemDTO> getWatchlistForUser(String userId) {
        log.info("Fetching watchlist for user: {}", userId);
        try {
            return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId)
                    .stream()
                    .map(this::mapToWatchlistDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching watchlist for user: {}. Error: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch watchlist.", e);
        }
    }

    // --- Mapper Methods (UNCHANGED) ---

    private WatchHistory mapToHistoryEntity(WatchHistoryRequestDTO dto) {
        WatchHistory entity = new WatchHistory();
        entity.setUserId(dto.getUserId());
        entity.setContentId(dto.getContentId());
        entity.setRating(dto.getRating());
        entity.setReviewText(dto.getReviewText());
        entity.setWatchedAt(Instant.now());
        return entity;
    }

    private WatchHistoryResponseDTO mapToHistoryResponseDTO(WatchHistory entity) {
        WatchHistoryResponseDTO dto = new WatchHistoryResponseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setContentId(entity.getContentId());
        dto.setRating(entity.getRating());
        dto.setReviewText(entity.getReviewText());
        dto.setWatchedAt(entity.getWatchedAt());
        return dto;
    }

    private WatchlistItemDTO mapToWatchlistDTO(WatchlistItem entity) {
        WatchlistItemDTO dto = new WatchlistItemDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setContentId(entity.getContentId());
        dto.setAddedAt(entity.getAddedAt());
        return dto;
    }
}