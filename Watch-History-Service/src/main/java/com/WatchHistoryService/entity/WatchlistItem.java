package com.WatchHistoryService.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "watchlist_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "contentId"}) // Prevent duplicates
})
@Getter @Setter @NoArgsConstructor
public class WatchlistItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String contentId; // e.g., "tmdb_155"

    @Column(nullable = false)
    private Instant addedAt;

    public WatchlistItem(String userId, String contentId) {
        this.userId = userId;
        this.contentId = contentId;
        this.addedAt = Instant.now();
    }
}