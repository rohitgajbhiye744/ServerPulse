package com.serverpulse.backend.security;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.serverpulse.backend.security.ApiKeyUtil;

public class ApiKeyUtilTest {


	@Test
	void generateApiKeyShouldReturnUniqueKeysWithCorrectPrefix() {
	    String key1 = ApiKeyUtil.generateApiKey();
	    String key2 = ApiKeyUtil.generateApiKey();

	    assertTrue(key1.startsWith("sp_"));
	    assertFalse(key1.isEmpty());
	    assertNotEquals(key1, key2);
	}

	@Test
	void hashApiKeyShouldBeConsistentAndProduceDifferentHashesForDifferentInputs() {
	    String hash1 = ApiKeyUtil.hashApiKey("test-secret");
	    String hash2 = ApiKeyUtil.hashApiKey("test-secret");
	    String hash3 = ApiKeyUtil.hashApiKey("different-secret");

	    assertEquals(64, hash1.length());
	    assertEquals(hash1, hash2);
	    assertNotEquals(hash1, hash3);
	}


}
