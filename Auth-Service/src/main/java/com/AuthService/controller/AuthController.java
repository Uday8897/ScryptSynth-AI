package com.AuthService.controller;


import com.AuthService.dto.JwtResponseDTO;
import com.AuthService.dto.LoginRequestDTO;
import com.AuthService.dto.RegisterRequestDTO;
import com.AuthService.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private RegisterRequestDTO requestDTO;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequestDTO requestDTO) {
        this.requestDTO = requestDTO;
        authService.registerUser(requestDTO);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> loginUser(@Valid @RequestBody LoginRequestDTO requestDTO) {
        JwtResponseDTO response = authService.loginUser(requestDTO);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody String token) {
        try {
            authService.validateToken(token);
            return ResponseEntity.ok().build(); // Return 200 OK if valid
        } catch (Exception e) {
            // Return an unauthorized status if the token is invalid for any reason
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}