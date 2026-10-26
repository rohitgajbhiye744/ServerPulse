package com.serverpulse.backend.service;

import org.springframework.stereotype.Service;

import com.serverpulse.backend.repository.UserRepository;

import java.util.Optional;

import com.serverpulse.backend.entity.AppUser;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AppUserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AppUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

    }

    public Optional<AppUser> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public AppUser createUser(String username, String rawPassword, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);

        AppUser user = new AppUser(username, passwordHash, role);

        return userRepository.save(user);
    }

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public AppUser createAdminIfNotExists(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            return userRepository.findByUsername(username)
                    .orElseThrow();
        }

        return createUser(username, password, "ADMIN");
    }

    public boolean verifyPassword(String username, String rawPassword) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }


}
