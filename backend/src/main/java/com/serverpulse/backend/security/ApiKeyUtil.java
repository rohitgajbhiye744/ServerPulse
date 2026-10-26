package com.serverpulse.backend.security;

import java.security.SecureRandom;
import java.util.Base64;
import java.security.MessageDigest;

public class ApiKeyUtil {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	public static String generateApiKey() {
	    byte[] randomBytes = new byte[32];
	    SECURE_RANDOM.nextBytes(randomBytes);

	    String encodedKey = Base64.getUrlEncoder()
	            .withoutPadding()
	            .encodeToString(randomBytes);

	    return "sp_" + encodedKey;
	}

	public static String hashApiKey(String apiKey) {
	    try {
	        MessageDigest digest = MessageDigest.getInstance("SHA-256");
	        byte[] hashBytes = digest.digest(
	                apiKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));

	        return java.util.HexFormat.of().formatHex(hashBytes);

	    } catch (java.security.NoSuchAlgorithmException e) {
	        throw new IllegalStateException("SHA-256 is unavailable", e);
	    }
	}

}
