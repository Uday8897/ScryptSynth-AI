package com.WatchHistoryService.dto;


import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContentDetails {
    private String id;
    private String title;
    private String description;
    private List<String> genres;
    private Integer releaseYear;
    private String director;
    private List<String> cast;
    private Integer duration;
    private String posterPath;
    private Double rating;
}