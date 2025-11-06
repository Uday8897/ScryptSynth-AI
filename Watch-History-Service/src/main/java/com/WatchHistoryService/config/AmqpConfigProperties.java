package com.WatchHistoryService.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "amqp")
@Data
public class AmqpConfigProperties {
    private String exchange;
    private String routingKey;
    private String queue;
}