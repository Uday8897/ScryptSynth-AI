package com.UserService.config;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;


@Configuration @RequiredArgsConstructor
public class RabbitMQConfig {
    private final AmqpConfigProperties props;
    @Bean public Queue queue() { return new Queue(props.getQueue(), true); }
    @Bean public TopicExchange exchange() { return new TopicExchange(props.getExchange()); }
    @Bean public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(props.getRoutingKey());
    }
    @Bean public MessageConverter jsonMessageConverter() { return new Jackson2JsonMessageConverter(); }
}