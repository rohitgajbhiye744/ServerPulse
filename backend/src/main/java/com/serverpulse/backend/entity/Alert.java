package com.serverpulse.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "alerts",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_alert_open_server_metric",
        columnNames = {"server_id", "metric_type", "open_alert_key"}
        ),
        indexes = {
                @Index(name = "idx_alert_created_at", columnList = "created_at"),
                @Index(name = "idx_alert_status", columnList = "status")
        }
)
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "metric_id", nullable = false)
    private ServerMetric metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false, length = 20)
    private AlertMetricType metricType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity;

    @Column(name = "observed_value", nullable = false)
    private double observedValue;

    @Column(name = "threshold_value", nullable = false)
    private double thresholdValue;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "open_alert_key", length = 20)
    private String openAlertKey;

    protected Alert() {
    }

    public Alert(
            Server server,
            ServerMetric metric,
            AlertMetricType metricType,
            AlertSeverity severity,
            double observedValue,
            double thresholdValue) {
        this.server = server;
        this.metric = metric;
        this.metricType = metricType;
        this.severity = severity;
        this.observedValue = observedValue;
        this.thresholdValue = thresholdValue;
        this.createdAt = Instant.now();
        this.status = AlertStatus.OPEN;
        this.openAlertKey = "OPEN";
    }

    public Long getId() { return id; }
    public Server getServer() { return server; }
    public ServerMetric getMetric() { return metric; }
    public AlertMetricType getMetricType() { return metricType; }
    public AlertSeverity getSeverity() { return severity; }
    public double getObservedValue() { return observedValue; }
    public double getThresholdValue() { return thresholdValue; }
    public Instant getCreatedAt() { return createdAt; }
    public AlertStatus getStatus() { return status; }
    public Instant getResolvedAt() { return resolvedAt; }

    public void updateObservation(
            AlertSeverity newSeverity,
            double newObservedValue,
            double newThresholdValue) {
        if (severity == AlertSeverity.WARNING && newSeverity == AlertSeverity.CRITICAL) {
            severity = AlertSeverity.CRITICAL;
        }
        observedValue = newObservedValue;
        thresholdValue = severity == AlertSeverity.CRITICAL
                ? newThresholdValue
                : thresholdValue;
    }

    public void resolve(Instant resolvedAt) {
        status = AlertStatus.RESOLVED;
        openAlertKey = null;
        this.resolvedAt = resolvedAt;
    }
}
