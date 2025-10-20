package com.AuthService.security;


import com.AuthService.entity.UserCredentials;
import lombok.Getter;
import org.springframework.security.core.userdetails.User;
import java.util.Collections;

@Getter
public class UserDetailsImpl extends User {
    private final Long id;
    public UserDetailsImpl(UserCredentials user) {
        super(user.getUsername(), user.getPassword(), Collections.emptyList());
        this.id = user.getId();
    }
}