package com.campustrack.service;

import com.campustrack.dto.Dtos;
import com.campustrack.exception.AppException;
import com.campustrack.model.User;
import com.campustrack.repository.UserRepository;
import com.campustrack.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository        userRepo;
    private final PasswordEncoder       encoder;
    private final JwtUtils              jwtUtils;

    /** Login — returns JWT + user info */
    public Dtos.AuthResponse login(Dtos.LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = jwtUtils.generateToken(auth);

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> AppException.notFound("User not found"));

        return buildAuthResponse(token, user);
    }

    /** Register — creates user, returns JWT + user info */
    @Transactional
    public Dtos.AuthResponse register(Dtos.RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw AppException.conflict("Email is already registered");
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(req.getRole() != null ? req.getRole() : User.Role.STUDENT)
                .department(req.getDepartment())
                .build();

        userRepo.save(user);

        String token = jwtUtils.generateTokenFromEmail(user.getEmail());
        return buildAuthResponse(token, user);
    }

    /** Get profile of the currently authenticated user */
    public Dtos.UserProfile getMyProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("User not found"));
        return Dtos.UserProfile.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .initials(user.getInitials())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    private Dtos.AuthResponse buildAuthResponse(String token, User user) {
        return Dtos.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .initials(user.getInitials())
                .build();
    }
}
