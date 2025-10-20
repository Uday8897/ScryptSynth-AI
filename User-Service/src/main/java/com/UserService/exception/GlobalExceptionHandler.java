package com.UserService.exception;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j // <-- Add this annotation for logging
public class GlobalExceptionHandler {

    // ... (other handlers are fine) ...

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        // ==========================================================
        // THIS IS THE CRITICAL LINE TO ADD
        log.error("An unexpected error occurred", ex); // <-- This will print the full stack trace
        // ==========================================================
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}