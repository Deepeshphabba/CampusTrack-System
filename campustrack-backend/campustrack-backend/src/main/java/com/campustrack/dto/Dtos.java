package com.campustrack.dto;

import com.campustrack.model.Issue;
import com.campustrack.model.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ─────────────────────────────── AUTH ────────────────────────────────────────

public class Dtos {

    // ── Register ────────────────────────────────────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Email(message = "Valid email required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private User.Role role = User.Role.STUDENT;
        private String department;
    }

    // ── Login ───────────────────────────────────────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email(message = "Valid email required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // ── Auth response (returned on login/register) ──────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType;
        private Long   id;
        private String fullName;
        private String email;
        private String role;
        private String department;
        private String initials;
    }

    // ── Compact user summary (used inside issue responses) ──────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserSummary {
        private Long   id;
        private String fullName;
        private String email;
        private String initials;
        private String role;
        private String department;
    }

    // ── Full user profile ────────────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserProfile {
        private Long   id;
        private String fullName;
        private String email;
        private String role;
        private String department;
        private String initials;
        private String createdAt;
    }

    // ── Create issue ────────────────────────────────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateIssueRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Category is required")
        private Issue.Category category;

        @NotNull(message = "Priority is required")
        private Issue.Priority priority;

        @NotBlank(message = "Location is required")
        private String location;

        private Long assignedToId;
    }

    // ── Update issue (all optional) ─────────────────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateIssueRequest {
        private String         title;
        private String         description;
        private Issue.Category category;
        private Issue.Status   status;
        private Issue.Priority priority;
        private String         location;
        private Long           assignedToId;
    }

    // ── Issue response ──────────────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class IssueResponse {
        private Long        id;
        private String      issueNumber;
        private String      title;
        private String      description;
        private String      category;
        private String      status;
        private String      priority;
        private String      location;
        private UserSummary reportedBy;
        private UserSummary assignedTo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;
    }

    // ── Dashboard stats ──────────────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardStats {
        private long totalIssues;
        private long openIssues;
        private long inProgressIssues;
        private long resolvedIssues;
        private long closedIssues;
        private long criticalIssues;
        private long highIssues;
        private long mediumIssues;
        private long lowIssues;
        private long infrastructureIssues;
        private long itNetworkIssues;
        private long academicIssues;
        private long safetyIssues;
        private long facilitiesIssues;
        private List<Map<String, Object>> weeklyTrend;
        private List<Map<String, Object>> topLocations;
        private List<Map<String, Object>> recentActivity;
    }

    // ── Generic message response ─────────────────────────────────────────────
    @Data @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    // ── Error response ───────────────────────────────────────────────────────
    @Data @AllArgsConstructor
    public static class ErrorResponse {
        private String message;
        private int    status;
        private long   timestamp;
    }
}
