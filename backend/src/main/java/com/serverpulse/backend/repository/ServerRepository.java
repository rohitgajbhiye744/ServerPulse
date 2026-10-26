package com.serverpulse.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.serverpulse.backend.entity.Server;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServerRepository extends JpaRepository<Server, Long> {

	Optional<Server> findByApiKeyHash(String apiKeyHash);

	boolean existsByName(String name);

	Optional<Server> findByName(String name);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select s from Server s where s.name = :name")
	Optional<Server> findByNameForUpdate(@Param("name") String name);

}
