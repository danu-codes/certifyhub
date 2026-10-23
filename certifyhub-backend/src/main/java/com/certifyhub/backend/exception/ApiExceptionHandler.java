package com.certifyhub.backend.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(
            IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
                Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<Map<String, String>> invalidJson(
            JsonProcessingException ex) {
        return ResponseEntity.badRequest().body(
                Map.of("error", "Invalid certificate settings JSON."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> uploadTooLarge(
            MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(
                HttpStatus.PAYLOAD_TOO_LARGE).body(
                        Map.of("error", "Uploaded files exceed the size limit."));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> ioError(
            IOException ex) {
        return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of("error", "Unable to process the certificate files."));
    }
}