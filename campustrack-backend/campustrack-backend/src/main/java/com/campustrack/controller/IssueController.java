package com.campustrack.controller;

import com.campustrack.dto.Dtos;
import com.campustrack.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    /**
     * GET /api/issues
     * Optional query params: status, category, keyword
     */
    @GetMapping
    public ResponseEntity<List<Dtos.IssueResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {

        if (status != null || category != null || keyword != null) {
            return ResponseEntity.ok(issueService.getFiltered(status, category, keyword));
        }
        return ResponseEntity.ok(issueService.getAll());
    }

    /**
     * GET /api/issues/stats  — dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Dtos.DashboardStats> getStats() {
        return ResponseEntity.ok(issueService.getStats());
    }

    /**
     * GET /api/issues/my  — issues reported by the logged-in user
     */
    @GetMapping("/my")
    public ResponseEntity<List<Dtos.IssueResponse>> getMyIssues(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(issueService.getMyIssues(ud.getUsername()));
    }

    /**
     * GET /api/issues/assigned  — issues assigned to the logged-in user
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<Dtos.IssueResponse>> getAssigned(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(issueService.getAssignedToMe(ud.getUsername()));
    }

    /**
     * GET /api/issues/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Dtos.IssueResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getById(id));
    }

    /**
     * POST /api/issues  — create new issue
     */
    @PostMapping
    public ResponseEntity<Dtos.IssueResponse> create(
            @Valid @RequestBody Dtos.CreateIssueRequest req,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(issueService.create(req, ud.getUsername()));
    }

    /**
     * PUT /api/issues/{id}  — full or partial update
     */
    @PutMapping("/{id}")
    public ResponseEntity<Dtos.IssueResponse> update(
            @PathVariable Long id,
            @RequestBody Dtos.UpdateIssueRequest req) {
        return ResponseEntity.ok(issueService.update(id, req));
    }

    /**
     * PATCH /api/issues/{id}/status  — quick status-only update
     * Body: { "status": "IN_PROGRESS" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Dtos.IssueResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Dtos.UpdateIssueRequest req) {
        return ResponseEntity.ok(issueService.update(id, req));
    }

    /**
     * DELETE /api/issues/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Dtos.MessageResponse> delete(@PathVariable Long id) {
        issueService.delete(id);
        return ResponseEntity.ok(new Dtos.MessageResponse("Issue deleted successfully"));
    }
}
