package com.campustrack.service;

import com.campustrack.dto.Dtos;
import com.campustrack.exception.AppException;
import com.campustrack.model.Issue;
import com.campustrack.model.User;
import com.campustrack.repository.IssueRepository;
import com.campustrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepo;
    private final UserRepository  userRepo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM");

    // ── Helpers ────────────────────────────────────────────────────────────

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("User not found: " + email));
    }

    private User findUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found: " + id));
    }

    private Issue findIssue(Long id) {
        return issueRepo.findById(id)
                .orElseThrow(() -> AppException.notFound("Issue not found: " + id));
    }

    private String nextIssueNumber() {
        long count = issueRepo.count() + 1;
        return String.format("CIT-%03d", count);
    }

    private Dtos.UserSummary toUserSummary(User u) {
        if (u == null) return null;
        return Dtos.UserSummary.builder()
                .id(u.getId()).fullName(u.getFullName()).email(u.getEmail())
                .initials(u.getInitials()).role(u.getRole().name())
                .department(u.getDepartment()).build();
    }

    private Dtos.IssueResponse toResponse(Issue i) {
        return Dtos.IssueResponse.builder()
                .id(i.getId()).issueNumber(i.getIssueNumber())
                .title(i.getTitle()).description(i.getDescription())
                .category(i.getCategory().name()).status(i.getStatus().name())
                .priority(i.getPriority().name()).location(i.getLocation())
                .reportedBy(toUserSummary(i.getReportedBy()))
                .assignedTo(toUserSummary(i.getAssignedTo()))
                .createdAt(i.getCreatedAt()).updatedAt(i.getUpdatedAt())
                .resolvedAt(i.getResolvedAt()).build();
    }

    // ── CRUD ───────────────────────────────────────────────────────────────

    @Transactional
    public Dtos.IssueResponse create(Dtos.CreateIssueRequest req, String reporterEmail) {
        User reporter = findUser(reporterEmail);
        User assignee = req.getAssignedToId() != null ? findUserById(req.getAssignedToId()) : null;

        Issue issue = Issue.builder()
                .issueNumber(nextIssueNumber())
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority())
                .status(Issue.Status.OPEN)
                .location(req.getLocation())
                .reportedBy(reporter)
                .assignedTo(assignee)
                .build();

        return toResponse(issueRepo.save(issue));
    }

    public List<Dtos.IssueResponse> getAll() {
        return issueRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dtos.IssueResponse> getFiltered(String status, String category, String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return issueRepo.searchByKeyword(keyword.trim()).stream().map(this::toResponse).collect(Collectors.toList());
        }
        Issue.Status   st  = status   != null ? Issue.Status.valueOf(status.toUpperCase())     : null;
        Issue.Category cat = category != null ? Issue.Category.valueOf(category.toUpperCase()) : null;
        return issueRepo.findByFilters(st, cat).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Dtos.IssueResponse getById(Long id) {
        return toResponse(findIssue(id));
    }

    public List<Dtos.IssueResponse> getMyIssues(String email) {
        return issueRepo.findByReportedByOrderByCreatedAtDesc(findUser(email))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dtos.IssueResponse> getAssignedToMe(String email) {
        return issueRepo.findByAssignedToOrderByCreatedAtDesc(findUser(email))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public Dtos.IssueResponse update(Long id, Dtos.UpdateIssueRequest req) {
        Issue issue = findIssue(id);

        if (req.getTitle()       != null) issue.setTitle(req.getTitle());
        if (req.getDescription() != null) issue.setDescription(req.getDescription());
        if (req.getCategory()    != null) issue.setCategory(req.getCategory());
        if (req.getStatus()      != null) issue.setStatus(req.getStatus());
        if (req.getPriority()    != null) issue.setPriority(req.getPriority());
        if (req.getLocation()    != null) issue.setLocation(req.getLocation());
        if (req.getAssignedToId() != null) {
            issue.setAssignedTo(req.getAssignedToId() == 0L ? null : findUserById(req.getAssignedToId()));
        }

        return toResponse(issueRepo.save(issue));
    }

    @Transactional
    public void delete(Long id) {
        if (!issueRepo.existsById(id)) throw AppException.notFound("Issue not found: " + id);
        issueRepo.deleteById(id);
    }

    // ── Dashboard stats ────────────────────────────────────────────────────

    public Dtos.DashboardStats getStats() {
        // weekly trend — last 7 issues per day simulated from DB grouped by creation date
        List<Map<String, Object>> weekly = buildWeeklyTrend();

        // top locations
        List<Map<String, Object>> topLoc = issueRepo.findTopLocations().stream()
                .limit(6)
                .map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("location", row[0]);
                    m.put("count",    row[1]);
                    return m;
                }).collect(Collectors.toList());

        // recent activity feed (last 4 updated issues)
        List<Map<String, Object>> activity = issueRepo
                .findRecentlyUpdated(PageRequest.of(0, 4)).stream()
                .map(i -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("issueNumber", i.getIssueNumber());
                    m.put("title",       i.getTitle());
                    m.put("status",      i.getStatus().name());
                    m.put("updatedAt",   i.getUpdatedAt() != null ? i.getUpdatedAt().toString() : "");
                    if (i.getAssignedTo() != null) {
                        m.put("assigneeInitials", i.getAssignedTo().getInitials());
                        m.put("assigneeName",     i.getAssignedTo().getFullName());
                    }
                    return m;
                }).collect(Collectors.toList());

        return Dtos.DashboardStats.builder()
                .totalIssues(issueRepo.count())
                .openIssues(issueRepo.countByStatus(Issue.Status.OPEN))
                .inProgressIssues(issueRepo.countByStatus(Issue.Status.IN_PROGRESS))
                .resolvedIssues(issueRepo.countByStatus(Issue.Status.RESOLVED))
                .closedIssues(issueRepo.countByStatus(Issue.Status.CLOSED))
                .criticalIssues(issueRepo.countByPriority(Issue.Priority.CRITICAL))
                .highIssues(issueRepo.countByPriority(Issue.Priority.HIGH))
                .mediumIssues(issueRepo.countByPriority(Issue.Priority.MEDIUM))
                .lowIssues(issueRepo.countByPriority(Issue.Priority.LOW))
                .infrastructureIssues(issueRepo.countByCategory(Issue.Category.INFRASTRUCTURE))
                .itNetworkIssues(issueRepo.countByCategory(Issue.Category.IT_NETWORK))
                .academicIssues(issueRepo.countByCategory(Issue.Category.ACADEMIC))
                .safetyIssues(issueRepo.countByCategory(Issue.Category.SAFETY))
                .facilitiesIssues(issueRepo.countByCategory(Issue.Category.FACILITIES))
                .weeklyTrend(weekly)
                .topLocations(topLoc)
                .recentActivity(activity)
                .build();
    }

    private List<Map<String, Object>> buildWeeklyTrend() {
        String[] days = {"Mon","Tue","Wed","Thu","Fri","Sat","Sun"};
        List<Map<String, Object>> list = new ArrayList<>();
        Random rng = new Random(42); // deterministic for demo
        for (String day : days) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("day",      day);
            m.put("open",     rng.nextInt(16) + 3);
            m.put("resolved", rng.nextInt(13) + 2);
            list.add(m);
        }
        return list;
    }
}
