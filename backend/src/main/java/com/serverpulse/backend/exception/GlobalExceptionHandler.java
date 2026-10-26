package com.serverpulse.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DuplicateServerException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	public String handleDuplicateServer(DuplicateServerException ex) {
	    return ex.getMessage();
	}

	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String handleInvalidInput(IllegalArgumentException ex) {
	    return ex.getMessage();
	}
}
