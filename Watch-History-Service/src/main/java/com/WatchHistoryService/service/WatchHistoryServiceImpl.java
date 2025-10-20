package com.WatchHistoryService.service; // Use your actual package name

import com.WatchHistoryService.config.AmqpConfigProperties;
import com.WatchHistoryService.dto.AmqpEventDTO;
import com.WatchHistoryService.dto.WatchHistoryRequestDTO;
import com.WatchHistoryService.dto.WatchHistoryResponseDTO;
import com.WatchHistoryService.dto.WatchlistItemDTO;
import com.WatchHistoryService.entity.WatchHistory;
import com.WatchHistoryService.entity.WatchlistItem;
import com.WatchHistoryService.exception.ResourceNotFoundException; // Assuming you have this
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
@RequiredArgsConstructor // Use Lombok constructor injection
public class WatchHistoryServiceImpl implements WatchHistoryService {

    private final WatchHistoryRepository historyRepository;
    private final WatchlistRepository watchlistRepository; // Inject Watchlist Repo
    private final RabbitTemplate rabbitTemplate;
    private final AmqpConfigProperties amqpConfigProperties;

    // --- Review / History Methods ---

    @Override
    @Transactional // Ensure atomicity
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
        // Create a descriptive text for the AI to learn from.
        String descriptiveContent = String.format("User rated content '%s' a %d out of 10. User review: %s",
                history.getContentId(), history.getRating(), history.getReviewText() != null ? history.getReviewText() : "N/A");

        AmqpEventDTO event = new AmqpEventDTO(history.getUserId(), descriptiveContent);

        try {
            // Send the structured DTO to RabbitMQ. Jackson converter handles JSON.
            rabbitTemplate.convertAndSend(amqpConfigProperties.getExchange(), amqpConfigProperties.getRoutingKey(), event);
            log.info("Published user activity event for user: {}, contentId: {}", history.getUserId(), history.getContentId());
        } catch (Exception e) {
            log.error("Failed to publish user activity event for user: {}. Error: {}", history.getUserId(), e.getMessage());
            // Decide if this should throw an error or just log (usually just log for decoupling)
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
        } catch (Exception e) {
            log.error("Error adding item {} to watchlist for user {}. Error: {}", contentId, userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to add item to watchlist.", e);
        }
        return mapToWatchlistDTO(savedItem);
    }

    @Override
    @Transactional
    public void removeFromWatchlist(String userId, String contentId) {
        log.info("Attempting to remove contentId: {} from watchlist for user: {}", contentId, userId);
        if (!watchlistRepository.existsByUserIdAndContentId(userId, contentId)) {
            log.warn("Item {} not found in watchlist for user {}. Skipping remove.", contentId, userId);
            throw new ResourceNotFoundException("Item not found in watchlist."); // Use specific exception
        }
        try {
            watchlistRepository.deleteByUserIdAndContentId(userId, contentId);
            log.info("Successfully removed item {} from watchlist for user {}.", contentId, userId);
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

    // --- Mapper Methods ---

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