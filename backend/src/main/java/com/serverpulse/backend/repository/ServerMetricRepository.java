package com.serverpulse.backend.repository;

import com.serverpulse.backend.entity.ServerMetric;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface ServerMetricRepository
        extends JpaRepository<ServerMetric, Long> {

    List<ServerMetric> findTop100ByServerNameOrderByRecordedAtDesc(
            String serverName);

    Optional<ServerMetric> findTopByServerNameOrderByRecordedAtDesc(String serverName);
}
