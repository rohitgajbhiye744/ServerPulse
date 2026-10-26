package com.serverpulse.backend.service;

import org.springframework.stereotype.Service;

import com.serverpulse.backend.repository.ServerRepository;
import com.serverpulse.backend.security.ApiKeyUtil;
import com.serverpulse.backend.entity.Server;
import com.serverpulse.backend.exception.DuplicateServerException;

@Service
public class ServerService {

	private final ServerRepository serverRepository;

	public ServerService(ServerRepository serverRepository) {
	    this.serverRepository = serverRepository;
	}

	public boolean isServerNameTaken(String name) {
	    return serverRepository.existsByName(name);
	}

	public String registerServer(String name) {
		if (name == null || name.isBlank()) {
		    throw new IllegalArgumentException("Server name cannot be empty");
		}

		if (name.length() > 100) {
		    throw new IllegalArgumentException(
		            "Server name cannot exceed 100 characters");
		}

		if (serverRepository.existsByName(name)) {
		    throw new DuplicateServerException("Server name already exists");
		}

	    String apiKey = ApiKeyUtil.generateApiKey();
	    String apiKeyHash = ApiKeyUtil.hashApiKey(apiKey);

	    Server server = new Server(name, apiKeyHash);
	    serverRepository.save(server);

	    return apiKey;
	}
}
