package com.serverpulse.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MetricRequest(

    @NotBlank
    @Size(max = 100)
    String serverName,

    @NotNull
    @Min(0)
    @Max(100)
    Double cpuUsage,

    @NotNull
    @Min(0)
    @Max(100)
    Double memoryUsage,

    @NotNull
    @Min(0)
    @Max(100)
    Double diskUsage,

    @NotNull
    @Min(0)
    Double loadAverage,

    @NotNull
    @Min(0)
    Integer logErrorCount

) {}
