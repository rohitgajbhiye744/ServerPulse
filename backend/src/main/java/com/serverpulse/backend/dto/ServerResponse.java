package com.serverpulse.backend.dto;

public record ServerResponse(
        Long id,
        String name,
        boolean active
) {}
