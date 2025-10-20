package com.WatchHistoryService.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class RabbitMQConfig {

    private final AmqpConfigProperties amqpConfigProperties;

    public RabbitMQConfig(AmqpConfigProperties amqpConfigProperties) {
        this.amqpConfigProperties = amqpConfigProperties;
    }

    @Bean
    public Queue queue() {
        return new Queue(amqpConfigProperties.getQueue());
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(amqpConfigProperties.getExchange());
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(amqpConfigProperties.getRoutingKey());
    }

    // This converter allows sending DTO objects as JSON directly
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}