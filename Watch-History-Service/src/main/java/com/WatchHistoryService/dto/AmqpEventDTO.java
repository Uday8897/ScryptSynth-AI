package com.WatchHistoryService.dto;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AmqpEventDTO {
    private String type; // "review_added", "watchlist_added", "rating_added", "content_viewed"
    private String userId;
    private String contentId;
    private String contentType; // "movie", "tv_show", etc.
    private String contentTitle;
    private String contentDescription;
    private Integer rating;
    private String reviewText;
    private String action; // "added", "removed", "updated"
    private Map<String, Object> metadata;
    private String timestamp;

    // Helper method to create descriptive content for AI
    public String generateAIContent() {
        switch (type) {
            case "review_added":
                return String.format(
                        "User wrote a %s review for '%s' (ID: %s). Rating: %d/10. Review: \"%s\". %s",
                        contentType != null ? contentType : "movie",
                        contentTitle != null ? contentTitle : "unknown content",
                        contentId,
                        rating != null ? rating : 0,
                        reviewText != null ? reviewText : "No detailed review provided",
                        contentDescription != null ? "Content description: " + contentDescription : ""
                );

            case "rating_added":
                return String.format(
                        "User rated '%s' (ID: %s) %d out of 10 stars. %s %s",
                        contentTitle != null ? contentTitle : "unknown content",
                        contentId,
                        rating != null ? rating : 0,
                        reviewText != null ? "Additional comments: \"" + reviewText + "\"." : "No additional comments.",
                        contentDescription != null ? "Content overview: " + contentDescription : ""
                );

            case "watchlist_added":
                return String.format(
                        "User added '%s' (ID: %s) to their watchlist. %s %s This indicates strong interest in %s content.",
                        contentTitle != null ? contentTitle : "unknown content",
                        contentId,
                        contentDescription != null ? "Content description: " + contentDescription + "." : "",
                        rating != null ? "They previously rated it " + rating + "/10." : "Not yet rated.",
                        contentType != null ? contentType : "this type of"
                );

            case "content_viewed":
                return String.format(
                        "User viewed '%s' (ID: %s). %s %s",
                        contentTitle != null ? contentTitle : "unknown content",
                        contentId,
                        contentDescription != null ? "Content about: " + contentDescription + "." : "",
                        rating != null ? "They rated it " + rating + "/10." : "Not yet rated."
                );

            default:
                return String.format(
                        "User activity on '%s' (ID: %s). Action: %s. %s %s",
                        contentTitle != null ? contentTitle : "unknown content",
                        contentId,
                        type,
                        rating != null ? "Rating: " + rating + "/10." : "",
                        reviewText != null ? "Review: \"" + reviewText + "\"." : ""
                );
        }
    }

    public String toJson() {
        try {
            return new ObjectMapper().writeValueAsString(this);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize AmqpEventDTO", e);
        }
    }
}