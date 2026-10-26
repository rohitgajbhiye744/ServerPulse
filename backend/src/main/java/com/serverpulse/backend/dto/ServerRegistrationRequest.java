package com.serverpulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ServerRegistrationRequest(
        @NotBlank(message = "Server name cannot be blank")
        @Size(max = 100, message = "Server name cannot exceed 100 characters")
        String name
) {
}
