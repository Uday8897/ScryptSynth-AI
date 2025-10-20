package com.AuthService.service;

import com.AuthService.client.UserClient;
import com.AuthService.config.AmqpConfigProperties;
import com.AuthService.dto.AmqpUserRegisteredDTO;
import com.AuthService.dto.JwtResponseDTO;
import com.AuthService.dto.LoginRequestDTO;
import com.AuthService.dto.RegisterRequestDTO;
import com.AuthService.entity.UserCredentials;
import com.AuthService.repository.UserCredentialsRepository;
import com.AuthService.security.JwtUtil;
import com.AuthService.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserCredentialsRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RabbitTemplate rabbitTemplate;
    private final AmqpConfigProperties amqpConfigProperties;
    private final UserClient userClient;

    @Override
    @Transactional
    public void registerUser(RegisterRequestDTO requestDTO) {
        if (repository.existsByUsername(requestDTO.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken!");
        }
        if (repository.existsByEmail(requestDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use!");
        }

        UserCredentials user = new UserCredentials();
        user.setUsername(requestDTO.getUsername());
        user.setEmail(requestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        UserCredentials savedUser = repository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Publish event to RabbitMQ
        AmqpUserRegisteredDTO event = new AmqpUserRegisteredDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
        rabbitTemplate.convertAndSend(amqpConfigProperties.getExchange(), amqpConfigProperties.getRoutingKey(), event);
        log.info("Published user registration event for userId: {}", savedUser.getId());
    }

    @Override
    public JwtResponseDTO loginUser(LoginRequestDTO requestDTO) {
        // 1. Authenticate the user using Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.getUsername(), requestDTO.getPassword())
        );
        // Store the authentication object in the security context (good practice)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 2. Extract user details and ID from the authenticated principal
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId(); // Get the ID from your custom UserDetailsImpl

        // 3. Generate the JWT token
        String jwt = jwtUtil.generateToken(authentication);

        // 4. Make the synchronous REST call to User Service for display name
        log.info("Calling User Service for profile of userId: {}", userId);
        UserClient.UserProfileDTO profile = userClient.getProfileById(userId);
        log.info("Received display name '{}' from User Service", profile.displayName());
        String displayName = profile.displayName(); // Extract display name

        // 5. Return the response including the userId
        log.info("Login successful for userId: {}. Returning token and profile info.", userId);
        return new JwtResponseDTO(jwt, displayName, userId); // <-- Pass userId here
    }
    @Override
    public void validateToken(String token) {
        // The JwtUtil's validation method will throw an exception if the token is invalid.
        // If it completes without an exception, the token is considered valid.
        jwtUtil.validateToken(token); // We need to add this method to JwtUtil
    }
}
