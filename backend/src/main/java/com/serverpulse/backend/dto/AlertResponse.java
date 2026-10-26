package com.serverpulse.backend.dto;

import com.serverpulse.backend.entity.*;
import java.time.Instant;

public record AlertResponse(
        Long id,
        String serverName,
        AlertMetricType metricType,
        AlertSeverity severity,
        double observedValue,
        double thresholdValue,
        Instant createdAt,
        AlertStatus status,
        Instant resolvedAt
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getServer().getName(),
                alert.getMetricType(),
                alert.getSeverity(),
                alert.getObservedValue(),
                alert.getThresholdValue(),
                alert.getCreatedAt(),
                alert.getStatus(),
                alert.getResolvedAt()
        );
    }
}
