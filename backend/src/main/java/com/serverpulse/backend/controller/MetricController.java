package com.serverpulse.backend.controller;

import com.serverpulse.backend.dto.MetricRequest;
import com.serverpulse.backend.entity.ServerMetric;
import com.serverpulse.backend.repository.ServerMetricRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import com.serverpulse.backend.entity.Server;
import com.serverpulse.backend.repository.ServerRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import com.serverpulse.backend.security.ApiKeyUtil;
import com.serverpulse.backend.service.AlertService;

@RestController
@RequestMapping("/api/agent/metrics")
public class MetricController {

    private final ServerMetricRepository repository;

    private final ServerRepository serverRepository;
    private final AlertService alertService;

    public MetricController(
            ServerMetricRepository repository,
            ServerRepository serverRepository,
            AlertService alertService) {
        this.repository = repository;
        this.serverRepository = serverRepository;
        this.alertService = alertService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServerMetric ingestMetric(
            @RequestHeader("X-API-Key") String apiKey,
            @Valid @RequestBody MetricRequest request) {
        String apiKeyHash = ApiKeyUtil.hashApiKey(apiKey);

        Server server = serverRepository.findByApiKeyHash(apiKeyHash)
                .filter(Server::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid server API key"));

        if (!server.getName().equals(request.serverName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Server name does not match API key");
        }

        ServerMetric metric = new ServerMetric(
                server.getName(),
                request.cpuUsage(),
                request.memoryUsage(),
                request.diskUsage(),
                request.loadAverage(),
                request.logErrorCount()
        );

        ServerMetric savedMetric = repository.save(metric);
        alertService.processSafely(savedMetric);
        return savedMetric;
    }

    @GetMapping("/{serverName}")
    public List<ServerMetric> getRecentMetrics(
            @PathVariable String serverName) {

        if (serverName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Server name is required");
        }

        return repository
                .findTop100ByServerNameOrderByRecordedAtDesc(serverName);
    }


}
