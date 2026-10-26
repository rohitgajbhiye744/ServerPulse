package com.serverpulse.backend.service;

import com.serverpulse.backend.config.AlertThresholdProperties;
import com.serverpulse.backend.entity.*;
import com.serverpulse.backend.repository.AlertRepository;
import com.serverpulse.backend.repository.ServerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock private AlertRepository alertRepository;
    @Mock private ServerRepository serverRepository;
    @Mock private PlatformTransactionManager transactionManager;
    @Mock private TransactionStatus transactionStatus;

    private AlertService alertService;
    private Server server;

    @BeforeEach
    void setUp() {
        AlertThresholdProperties thresholds = new AlertThresholdProperties();
        when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        server = new Server("web-01", "hash");
        server.setId(1L);
        when(serverRepository.findByNameForUpdate("web-01")).thenReturn(Optional.of(server));
        when(alertRepository.findByServerIdAndMetricTypeAndStatus(anyLong(), any(), eq(AlertStatus.OPEN)))
                .thenReturn(Optional.empty());
        alertService = new AlertService(
                alertRepository, serverRepository, thresholds, transactionManager);
    }

    @ParameterizedTest
    @CsvSource({
            "CPU,70,WARNING",
            "MEMORY,75,WARNING",
            "DISK,80,WARNING"
    })
    void createsWarningAtWarningThreshold(
            AlertMetricType type, double value, AlertSeverity severity) {
        alertService.processSafely(metricFor(type, value));

        verify(alertRepository).save(argThat(alert ->
                alert.getMetricType() == type && alert.getSeverity() == severity));
    }

    @ParameterizedTest
    @CsvSource({
            "CPU,90,CRITICAL",
            "MEMORY,90,CRITICAL",
            "DISK,95,CRITICAL"
    })
    void createsCriticalAtCriticalThreshold(
            AlertMetricType type, double value, AlertSeverity severity) {
        alertService.processSafely(metricFor(type, value));

        verify(alertRepository).save(argThat(alert ->
                alert.getMetricType() == type && alert.getSeverity() == severity));
    }

    @Test
    void doesNotCreateAlertBelowWarningThreshold() {
        alertService.processSafely(metric(69, 74, 79, AlertMetricType.CPU));

        verify(alertRepository, never()).save(any());
    }

    @Test
    void doesNotCreateDuplicateForPersistentCondition() {
        Alert existing = new Alert(server, metric(80, 0, 0, AlertMetricType.CPU),
                AlertMetricType.CPU, AlertSeverity.WARNING, 80, 70);
        when(alertRepository.findByServerIdAndMetricTypeAndStatus(
                1L, AlertMetricType.CPU, AlertStatus.OPEN)).thenReturn(Optional.of(existing));

        alertService.processSafely(metric(82, 0, 0, AlertMetricType.CPU));

        verify(alertRepository, never()).save(any());
        assertEquals(82, existing.getObservedValue());
    }

    @Test
    void escalatesWarningAndKeepsCriticalOpenInWarningRange() {
        Alert existing = new Alert(server, metric(80, 0, 0, AlertMetricType.CPU),
                AlertMetricType.CPU, AlertSeverity.WARNING, 80, 70);
        when(alertRepository.findByServerIdAndMetricTypeAndStatus(
                1L, AlertMetricType.CPU, AlertStatus.OPEN)).thenReturn(Optional.of(existing));

        alertService.processSafely(metric(95, 0, 0, AlertMetricType.CPU));
        assertEquals(AlertSeverity.CRITICAL, existing.getSeverity());

        alertService.processSafely(metric(80, 0, 0, AlertMetricType.CPU));
        verify(alertRepository, never()).save(any());
        assertEquals(AlertStatus.OPEN, existing.getStatus());
    }

    @Test
    void resolvesOnlyWhenValueDropsBelowWarning() {
        Alert existing = new Alert(server, metric(95, 0, 0, AlertMetricType.CPU),
                AlertMetricType.CPU, AlertSeverity.CRITICAL, 95, 90);
        when(alertRepository.findByServerIdAndMetricTypeAndStatus(
                1L, AlertMetricType.CPU, AlertStatus.OPEN)).thenReturn(Optional.of(existing));

        alertService.processSafely(metric(69, 0, 0, AlertMetricType.CPU));

        assertEquals(AlertStatus.RESOLVED, existing.getStatus());
        verify(alertRepository, never()).save(any());
    }

    private ServerMetric metric(double cpu, double memory, double disk, AlertMetricType type) {
        return new ServerMetric("web-01", cpu, memory, disk, 0, 0);
    }

    private ServerMetric metricFor(AlertMetricType type, double value) {
        return switch (type) {
            case CPU -> metric(value, 0, 0, type);
            case MEMORY -> metric(0, value, 0, type);
            case DISK -> metric(0, 0, value, type);
        };
    }
}
