package com.serverpulse.backend.controller;

import com.serverpulse.backend.dto.AlertResponse;
import com.serverpulse.backend.entity.*;
import com.serverpulse.backend.service.AlertService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertResponse> getAlerts(
            @RequestParam(required = false) String serverName,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) AlertStatus status) {
        return alertService.findAlerts(serverName, severity, status)
                .stream()
                .map(AlertResponse::from)
                .toList();
    }
}
