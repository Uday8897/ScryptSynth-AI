package com.UserService.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
@Entity @Table(name = "user_profiles") @Getter @Setter
public class UserProfile {
    @Id private Long id;
    @Column(unique = true, nullable = false) private String username;
    @Column(unique = true, nullable = false) private String email;
    private String displayName;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_subscriptions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "subscription")
    private List<String> subscriptions = new ArrayList<>();
}