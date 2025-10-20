package com.ApiGateway.filter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.web.reactive.function.client.WebClient;
@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouterValidator routerValidator;

    private final WebClient.Builder webClientBuilder;

    // ==========================================================
    // CHANGE THE CONSTRUCTOR TO INJECT THE BEAN
    // ==========================================================
    @Autowired // Spring will now inject the @LoadBalanced bean we created
    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            log.info("Request received for URI: {}", request.getURI());

            if (routerValidator.isSecured.test(request)) {
                log.info("Endpoint is secured. Checking for authentication headers...");

                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    log.warn("Missing Authorization header for secured endpoint: {}", request.getURI());
                    return this.onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    log.warn("Authorization header is invalid for URI: {}", request.getURI());
                    return this.onError(exchange, "Authorization header is invalid", HttpStatus.UNAUTHORIZED);
                }

                String token = authHeader.substring(7);

                // Make the REST call to the Auth Service to validate the token
                return webClientBuilder.build().post()
                        .uri("http://auth-service/auth/validate") // Use service name with Eureka
                        .bodyValue(token)
                        .retrieve()
                        .toBodilessEntity()
                        .flatMap(response -> {
                            log.info("Token validation successful. Status: {}", response.getStatusCode());
                            return chain.filter(exchange); // If successful, proceed with the filter chain
                        }).onErrorResume(error -> {
                            log.error("Token validation failed. Error: {}", error.getMessage());
                            return this.onError(exchange, "JWT Token is invalid or expired", HttpStatus.UNAUTHORIZED);
                        });
            }

            log.info("Endpoint is public. Skipping authentication check.");
            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {}
}