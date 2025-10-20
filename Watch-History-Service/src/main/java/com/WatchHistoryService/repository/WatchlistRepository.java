package com.WatchHistoryService.repository;

import com.WatchHistoryService.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(String userId);
    boolean existsByUserIdAndContentId(String userId, String contentId);
    void deleteByUserIdAndContentId(String userId, String contentId);
}