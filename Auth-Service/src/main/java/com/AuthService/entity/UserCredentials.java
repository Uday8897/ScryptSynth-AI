package com.AuthService.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "user_credentials")
@Getter @Setter
public class UserCredentials {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String username;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String password;
}