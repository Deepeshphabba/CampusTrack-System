package com.campustrack.controller;

import com.campustrack.dto.Dtos;
import com.campustrack.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users  — all users (for admin views / assignment dropdowns)
     */
    @GetMapping
    public ResponseEntity<List<Dtos.UserSummary>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * GET /api/users/staff  — only STAFF + ADMIN (for assignment dropdowns)
     */
    @GetMapping("/staff")
    public ResponseEntity<List<Dtos.UserSummary>> getStaff() {
        return ResponseEntity.ok(userService.getStaffAndAdmins());
    }

    /**
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Dtos.UserSummary> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
