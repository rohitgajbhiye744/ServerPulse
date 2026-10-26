package com.serverpulse.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.serverpulse.backend.exception.DuplicateServerException;
import com.serverpulse.backend.repository.ServerRepository;
import com.serverpulse.backend.service.ServerService;


@ExtendWith(MockitoExtension.class)
public class ServerServiceTest {

	@Mock
	private ServerRepository serverRepository;

	@InjectMocks
	private ServerService serverService;

	@Test
	void registerServer_shouldSaveServerAndReturnApiKey() {
	    when(serverRepository.existsByName("web-server-01"))
	            .thenReturn(false);

	    String apiKey = serverService.registerServer("web-server-01");

	    assertNotNull(apiKey);
	    assertTrue(apiKey.startsWith("sp_"));

	    verify(serverRepository).save(any(com.serverpulse.backend.entity.Server.class));
	}

	@Test
	void registerServer_shouldRejectDuplicateName() {
	    when(serverRepository.existsByName("web-server-01"))
	            .thenReturn(true);

	    assertThrows(
                DuplicateServerException.class,
	            () -> serverService.registerServer("web-server-01")
	    );

	    verify(serverRepository, never()).save(any());
	}

	@Test
	void registerServer_shouldRejectBlankName() {
	    assertThrows(
	            IllegalArgumentException.class,
	            () -> serverService.registerServer("   ")
	    );

	    verifyNoInteractions(serverRepository);
	}

	@Test
	void registerServer_shouldRejectNameLongerThan100Characters() {
	    String longName = "a".repeat(101);

	    assertThrows(
	            IllegalArgumentException.class,
	            () -> serverService.registerServer(longName)
	    );

	    verifyNoInteractions(serverRepository);
	}

}
