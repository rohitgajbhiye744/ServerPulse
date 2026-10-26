package com.serverpulse.backend.service;

import com.serverpulse.backend.config.AlertThresholdProperties;
import com.serverpulse.backend.entity.*;
import com.serverpulse.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.TransactionDefinition;
import java.time.Instant;
import java.util.List;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);
    private final AlertRepository alertRepository;
    private final ServerRepository serverRepository;
    private final AlertThresholdProperties thresholds;
    private final TransactionTemplate transactionTemplate;

    public AlertService(
            AlertRepository alertRepository,
            ServerRepository serverRepository,
            AlertThresholdProperties thresholds,
            org.springframework.transaction.PlatformTransactionManager transactionManager) {
        this.alertRepository = alertRepository;
        this.serverRepository = serverRepository;
        this.thresholds = thresholds;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(
                TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    private void evaluate(ServerMetric metric) {
        // Serializes evaluations for one server; the unique constraint is defense in depth.
        Server server = serverRepository.findByNameForUpdate(metric.getServerName())
                .orElseThrow(() -> new IllegalStateException("Server not found during alert evaluation"));
        evaluateMetric(server, metric, AlertMetricType.CPU, metric.getCpuUsage(), thresholds.getCpu());
        evaluateMetric(server, metric, AlertMetricType.MEMORY, metric.getMemoryUsage(), thresholds.getMemory());
        evaluateMetric(server, metric, AlertMetricType.DISK, metric.getDiskUsage(), thresholds.getDisk());
    }

    private void evaluateMetric(
            Server server,
            ServerMetric metric,
            AlertMetricType type,
            double value,
            AlertThresholdProperties.Threshold threshold) {
        Alert alert = alertRepository
                .findByServerIdAndMetricTypeAndStatus(server.getId(), type, AlertStatus.OPEN)
                .orElse(null);

        if (value < threshold.getWarning()) {
            if (alert != null) alert.resolve(Instant.now());
            return;
        }

        AlertSeverity severity = value >= threshold.getCritical()
                ? AlertSeverity.CRITICAL
                : AlertSeverity.WARNING;
        double severityThreshold = severity == AlertSeverity.CRITICAL
                ? threshold.getCritical()
                : threshold.getWarning();

        if (alert == null) {
            alertRepository.save(new Alert(
                    server, metric, type, severity, value, severityThreshold));
        } else {
            alert.updateObservation(severity, value, severityThreshold);
        }
    }

    public List<Alert> findAlerts(String serverName, AlertSeverity severity, AlertStatus status) {
        return alertRepository.findFiltered(serverName, severity, status);
    }

    public void processSafely(ServerMetric metric) {
        try {
            transactionTemplate.executeWithoutResult(status -> evaluate(metric));
        } catch (RuntimeException ex) {
            log.error("Alert evaluation failed for metric {}. Metric ingestion remains successful.",
                    metric.getId(), ex);
        }
    }
}
