package com.campustrack.controller;

import com.campustrack.dto.Dtos;
import com.campustrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<Dtos.AuthResponse> login(@Valid @RequestBody Dtos.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<Dtos.AuthResponse> register(@Valid @RequestBody Dtos.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    /** GET /api/auth/me — returns current user's profile */
    @GetMapping("/me")
    public ResponseEntity<Dtos.UserProfile> me(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(authService.getMyProfile(ud.getUsername()));
    }
}
