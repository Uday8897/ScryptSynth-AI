package com.ApiGateway.filter;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouterValidator {

    // List of all endpoints that do not require authentication
    public static final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/login"
    );

    // Predicate to check if a request is for a secured endpoint
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}