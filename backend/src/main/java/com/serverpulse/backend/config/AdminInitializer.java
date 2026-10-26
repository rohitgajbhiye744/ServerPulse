package com.serverpulse.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.serverpulse.backend.service.AppUserService;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner initializeAdmin(AppUserService appUserService) {
        return args -> {
            String username = System.getenv("SERVERPULSE_ADMIN_USERNAME");
            String password = System.getenv("SERVERPULSE_ADMIN_PASSWORD");

            if (username == null || username.isBlank()
                    || password == null || password.isBlank()) {
                throw new IllegalStateException(
                        "Set SERVERPULSE_ADMIN_USERNAME and "
                        + "SERVERPULSE_ADMIN_PASSWORD environment variables.");
            }

            appUserService.createAdminIfNotExists(username, password);

            System.out.println("ServerPulse admin initialization completed.");
        };
    }
}
