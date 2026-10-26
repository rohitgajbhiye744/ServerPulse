package com.serverpulse.backend.repository;

import com.serverpulse.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    Optional<Alert> findByServerIdAndMetricTypeAndStatus(
            Long serverId, AlertMetricType metricType, AlertStatus status);

    @Query("""
            select a from Alert a
            where (:serverName is null or a.server.name = :serverName)
              and (:severity is null or a.severity = :severity)
              and (:status is null or a.status = :status)
            order by a.createdAt desc
            """)
    List<Alert> findFiltered(
            @Param("serverName") String serverName,
            @Param("severity") AlertSeverity severity,
            @Param("status") AlertStatus status);
}
