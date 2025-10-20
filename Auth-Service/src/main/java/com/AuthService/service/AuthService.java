package com.AuthService.service;


import com.AuthService.dto.JwtResponseDTO;
import com.AuthService.dto.LoginRequestDTO;
import com.AuthService.dto.RegisterRequestDTO;

public interface AuthService {
    void registerUser(RegisterRequestDTO requestDTO);
    JwtResponseDTO loginUser(LoginRequestDTO requestDTO);
    void validateToken(String token);
}