package com.serverpulse.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

import com.serverpulse.backend.dto.ServerRegistrationRequest;
import com.serverpulse.backend.service.ServerService;

@RestController
@RequestMapping("/api/admin/servers")
public class ServerController {

	private final ServerService serverService;

	public ServerController(ServerService serverService) {
	    this.serverService = serverService;
	}

	@PostMapping
	public ResponseEntity<String> registerServer(
	        @Valid @RequestBody ServerRegistrationRequest request) {

	    String apiKey = serverService.registerServer(request.name());

	    return ResponseEntity.status(HttpStatus.CREATED).body(apiKey);
	}

}
