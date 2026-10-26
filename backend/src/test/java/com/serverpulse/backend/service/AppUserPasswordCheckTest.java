package com.serverpulse.backend.service;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.serverpulse.backend.entity.AppUser;
import com.serverpulse.backend.repository.UserRepository;

@SpringBootTest
class AppUserPasswordCheckTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void checkAdminPassword() {
        AppUser user = userRepository.findByUsername("rohit")
                .orElseThrow(() -> new AssertionError("Admin user not found"));

        String password = System.getenv("SERVERPULSE_ADMIN_PASSWORD");

        assertTrue(password != null && !password.isBlank(),
                "SERVERPULSE_ADMIN_PASSWORD is not set for this test");

        boolean matches = passwordEncoder.matches(
                password, user.getPasswordHash());

        System.out.println("Admin password matches stored hash: " + matches);

        assertTrue(matches,
                "The configured admin password does not match the database hash");
    }
}
