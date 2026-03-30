package com.campustrack.exception;

import com.campustrack.dto.Dtos;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleApp(AppException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new Dtos.ErrorResponse(ex.getMessage(), ex.getStatus().value(), System.currentTimeMillis()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleBadCreds(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new Dtos.ErrorResponse("Invalid email or password", 401, System.currentTimeMillis()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field = ((FieldError) err).getField();
            errors.put(field, err.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Dtos.ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new Dtos.ErrorResponse("An unexpected error occurred: " + ex.getMessage(),
                        500, System.currentTimeMillis()));
    }
}
