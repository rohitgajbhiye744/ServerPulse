package com.serverpulse.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "metrics",
    indexes = {
        @Index(
            name = "idx_metrics_server_recorded",
            columnList = "server_name, recorded_at"
        )
    }
)
public class ServerMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "server_name", nullable = false, length = 100)
    private String serverName;

    @Column(name = "cpu_usage", nullable = false)
    private double cpuUsage;

    @Column(name = "memory_usage", nullable = false)
    private double memoryUsage;

    @Column(name = "disk_usage", nullable = false)
    private double diskUsage;

    @Column(name = "load_average", nullable = false)
    private double loadAverage;

    @Column(name = "log_error_count", nullable = false)
    private int logErrorCount;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    protected ServerMetric() {
    }

    public ServerMetric(
            String serverName,
            double cpuUsage,
            double memoryUsage,
            double diskUsage,
            double loadAverage,
            int logErrorCount) {
        this.serverName = serverName;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.diskUsage = diskUsage;
        this.loadAverage = loadAverage;
        this.logErrorCount = logErrorCount;
        this.recordedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getServerName() {
        return serverName;
    }

    public double getCpuUsage() {
        return cpuUsage;
    }

    public double getMemoryUsage() {
        return memoryUsage;
    }

    public double getDiskUsage() {
        return diskUsage;
    }

    public double getLoadAverage() {
        return loadAverage;
    }

    public int getLogErrorCount() {
        return logErrorCount;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}
