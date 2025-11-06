package com.WatchHistoryService.client;


import com.WatchHistoryService.dto.ContentDetails;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "content-search-service", path = "/api/content/movies")
public interface ContentServiceClient {

    @GetMapping("/{contentId}")
    ContentDetails getContentDetails(@PathVariable("contentId") String contentId);

    @GetMapping("/{contentId}/basic")
    ContentDetails getBasicContentDetails(@PathVariable("contentId") String contentId);
}