package com.WatchHistoryService.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "watch_history")
@Getter
@Setter
public class WatchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String contentId; // e.g., TMDB movie ID "tt0133093"

    @Column(nullable = false)
    private Integer rating; // e.g., 1-10

    private String reviewText; // Optional text review

    @Column(nullable = false)
    private Instant watchedAt;
}