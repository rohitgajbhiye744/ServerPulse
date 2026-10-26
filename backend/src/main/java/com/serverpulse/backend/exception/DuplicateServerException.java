package com.serverpulse.backend.exception;

public class DuplicateServerException extends RuntimeException {

    public DuplicateServerException(String message) {
        super(message);
    }
}
