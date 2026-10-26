package com.serverpulse.backend.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.serverpulse.backend.entity.ServerMetric;
import com.serverpulse.backend.repository.ServerMetricRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.serverpulse.backend.entity.Server;
import com.serverpulse.backend.repository.ServerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.serverpulse.backend.dto.ServerResponse;

@RestController
@RequestMapping("/api/servers")
public class DashboardController {
	private final ServerMetricRepository metricRepository;
	private final ServerRepository serverRepository;

	public DashboardController(
	        ServerMetricRepository metricRepository,
	        ServerRepository serverRepository) {
	    this.metricRepository = metricRepository;
	    this.serverRepository = serverRepository;
	}

	@GetMapping("/{serverName}/metrics")
	public List<ServerMetric> getServerMetrics(
	        @PathVariable String serverName) {

		Server server = serverRepository.findByName(serverName)
		        .filter(Server::isActive)
		        .orElseThrow(() -> new ResponseStatusException(
		                HttpStatus.NOT_FOUND, "Server not found or inactive"));

	    return metricRepository
	            .findTop100ByServerNameOrderByRecordedAtDesc(serverName);
	}

	@GetMapping
	public List<ServerResponse> getAllServers() {
	return serverRepository.findAll()
	.stream()
	.map(server -> new ServerResponse(
	server.getId(),
	server.getName(),
	server.isActive()
	))
	.toList();
	}

	@GetMapping("/{serverName}/latest")
	public ServerMetric getLatestMetric(@PathVariable String serverName) {

	    serverRepository.findByName(serverName)
	            .filter(Server::isActive)
	            .orElseThrow(() -> new ResponseStatusException(
	                    HttpStatus.NOT_FOUND, "Server not found or inactive"));

	    return metricRepository
	            .findTopByServerNameOrderByRecordedAtDesc(serverName)
	            .orElseThrow(() -> new ResponseStatusException(
	                    HttpStatus.NOT_FOUND, "No metrics available for this server"));
	}

}
