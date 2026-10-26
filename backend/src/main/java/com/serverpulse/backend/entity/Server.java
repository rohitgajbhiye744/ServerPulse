package com.serverpulse.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

@Entity
@Table(name = "servers")
public class Server {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 100)
	private String name;

	@Column(nullable = false, unique = true, length = 64)
	private String apiKeyHash;

	@Column(nullable = false)
	private boolean active = true;


	public Server(String name, String apiKeyHash) {
	    this.name = name;
	    this.apiKeyHash = apiKeyHash;
	}

	protected Server() {
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getApiKeyHash() {
		return apiKeyHash;
	}

	public void setApiKeyHash(String apiKeyHash) {
		this.apiKeyHash = apiKeyHash;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}



}
